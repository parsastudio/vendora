import "server-only";
import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "password",
      "passwordHash",
      "token",
      "secret",
      "twoFactorSecret",
      "apiKey",
      "keyHash",
    ],
    censor: "[REDACTED]",
  },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
