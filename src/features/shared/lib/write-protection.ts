import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";

export function withWriteProtection<Args extends unknown[], Return>(
  action: (...args: Args) => Promise<Return>,
) {
  return async (...args: Args): Promise<Return> => {
    const session = await getServerSession(authOptions);
    if (session?.user?.tenantId === "tenant-demo") {
      throw new Error("DEMO_RESTRICTED");
    }
    return action(...args);
  };
}
