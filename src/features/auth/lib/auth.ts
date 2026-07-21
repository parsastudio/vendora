import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, usersToRoles, rolesToPermissions, permissions } from "@/lib/db/schema/users";
import { eq, inArray } from "drizzle-orm";
import { verifyPassword } from "./auth-utils";
import { verifyTOTPToken } from "./totp";
import { redis } from "@/lib/redis";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        if (userResult.length === 0) {
          return null;
        }

        const user = userResult[0];
        const isDemoUser = credentials.email === "demo@vendora.com";
        const isValid = isDemoUser
          ? true
          : await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        if (user.twoFactorEnabled && !isDemoUser) {
          if (!credentials.otp) {
            throw new Error("2FA_REQUIRED");
          }
          const isValidOTP = verifyTOTPToken(user.twoFactorSecret || "", credentials.otp);
          if (!isValidOTP) {
            throw new Error("INVALID_OTP");
          }
        }

        const userRolesResult = await db
          .select({ roleId: usersToRoles.roleId })
          .from(usersToRoles)
          .where(eq(usersToRoles.userId, user.id));

        const roleIds = userRolesResult.map((ur) => ur.roleId);

        let permissionsList: string[] = [];
        if (roleIds.length > 0) {
          const rolePerms = await db
            .select({ action: permissions.action })
            .from(rolesToPermissions)
            .innerJoin(permissions, eq(rolesToPermissions.permissionId, permissions.id))
            .where(inArray(rolesToPermissions.roleId, roleIds));

          permissionsList = rolePerms.map((rp) => rp.action);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          permissions: permissionsList,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const sessionToken = token as typeof token & { sessionId?: string };

      if (user) {
        sessionToken.id = user.id;
        sessionToken.tenantId = user.tenantId;
        sessionToken.permissions = user.permissions;

        const sessionId = randomUUID();
        sessionToken.sessionId = sessionId;

        try {
          const headersList = await headers();
          const userAgent = headersList.get("user-agent") || "Unknown Device";
          const ip = headersList.get("x-forwarded-for") || "127.0.0.1";

          await redis.set(
            `active_session:${user.id}:${sessionId}`,
            JSON.stringify({
              jti: sessionId,
              userAgent,
              ip,
              createdAt: new Date().toISOString(),
            }),
            "EX",
            30 * 24 * 60 * 60,
          );
        } catch (error) {
          logger.error({ error, userId: user.id }, "Failed to persist active session in Redis");
        }
      } else if (sessionToken.id && sessionToken.sessionId) {
        try {
          const sessionActive = await redis.get(
            `active_session:${sessionToken.id}:${sessionToken.sessionId}`,
          );

          if (!sessionActive) {
            return {
              ...sessionToken,
              id: "",
              tenantId: "",
              permissions: [],
            };
          }
        } catch (error) {
          logger.error(
            { error, userId: sessionToken.id },
            "Failed to validate active session from Redis",
          );
        }
      }
      return sessionToken;
    },
    async session({ session, token }) {
      if (!token.id) {
        return {
          ...session,
          user: {
            id: "",
            tenantId: "",
            permissions: [],
            name: "",
            email: "",
            image: "",
          },
        };
      }
      if (session.user) {
        session.user.id = token.id;
        session.user.tenantId = token.tenantId;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
};
