import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: isDev ? "debug" : "info",
  transport: isDev
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
  redact: {
    // Never log sensitive fields (SECURITY-03)
    paths: [
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "apiKey",
      "authorization",
      "cookie",
      "*.password",
      "*.token",
    ],
    remove: true,
  },
});

export function createRequestLogger(requestId: string, userId?: string) {
  return logger.child({ requestId, userId });
}
