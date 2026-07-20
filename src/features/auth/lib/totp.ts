import crypto from "crypto";

export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString("hex");
}

export function verifyTOTPToken(secretHex: string, token: string): boolean {
  const timeStep = 30;
  const counter = Math.floor(Date.now() / 1000 / timeStep);

  for (let i = -1; i <= 1; i++) {
    const checkCounter = counter + i;
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(checkCounter / 0x100000000), 0);
    buffer.writeUInt32BE(checkCounter % 0x100000000, 4);

    const hmac = crypto.createHmac("sha1", Buffer.from(secretHex, "hex"));
    hmac.update(buffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const code = (binary % 1000000).toString().padStart(6, "0");
    if (code === token) {
      return true;
    }
  }
  return false;
}
