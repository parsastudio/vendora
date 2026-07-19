import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users, usersToRoles, rolesToPermissions, permissions } from "@/lib/db/schema/users";
import { eq, inArray } from "drizzle-orm";
import { verifyPassword } from "./auth-utils";

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
        const isValid = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
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
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
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
