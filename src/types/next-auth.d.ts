import "next-auth";
import type { DefaultSession } from "next-auth";

export type AppUserRole = "ADMIN" | "CONTRACTING_OFFICER" | "EVALUATOR";

declare module "next-auth" {
  interface User {
    role?: AppUserRole;
    protectedBAccess?: boolean;
  }

  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
      role?: AppUserRole;
      protectedBAccess?: boolean;
      adminAccess?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppUserRole;
    protectedBAccess?: boolean;
    adminAccess?: boolean;
  }
}
