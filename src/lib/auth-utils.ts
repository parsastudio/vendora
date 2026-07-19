import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string,
): boolean {
  if (!userPermissions) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
}
