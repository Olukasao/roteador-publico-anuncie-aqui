import "dotenv/config";

function parseCsv(value: string | undefined): string[] | true {
  if (!value || !value.trim()) return true;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: parseCsv(process.env.CORS_ORIGINS),
  internalToken: process.env.CONNECT_INTERNAL_TOKEN ?? "",
};

if (!config.internalToken) {
  throw new Error(
    "CONNECT_INTERNAL_TOKEN ausente — gere com `openssl rand -hex 32` e defina em apps/api/.env",
  );
}
