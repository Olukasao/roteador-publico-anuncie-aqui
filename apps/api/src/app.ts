import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError } from "zod";
import { config } from "./config.js";
import { AppError } from "./errors.js";
import { registerPublicRegistrationRoutes } from "./routes/publicRegistrationRoutes.js";
import { registerPublicSessionRoutes } from "./routes/publicSessionRoutes.js";
import { registerInternalMarketingRoutes } from "./routes/internalMarketingRoutes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: config.corsOrigins });

  app.get("/api/health", async () => ({ ok: true }));

  await registerPublicRegistrationRoutes(app);
  await registerPublicSessionRoutes(app);
  await registerInternalMarketingRoutes(app);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({ code: error.code, message: error.message });
      return;
    }

    if (error instanceof ZodError) {
      reply.code(400).send({ code: "VALIDATION_ERROR", message: error.issues[0]?.message ?? "Dados inválidos." });
      return;
    }

    app.log.error(error);
    reply.code(500).send({ code: "INTERNAL_ERROR", message: "Erro interno." });
  });

  return app;
}
