import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    tenantId: string;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    tenantId: string;
    permissions: string[];
  }
}
