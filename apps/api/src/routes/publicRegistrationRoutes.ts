import type { FastifyInstance } from "fastify";
import { visitorRegistrationSchema } from "@acessanet/shared";
import { prisma } from "../lib/prisma.js";

const TERMS_VERSION = "2026-10-08";
const MARKETING_VERSION = "2026-10-08";

export async function registerPublicRegistrationRoutes(app: FastifyInstance) {
  app.post("/api/v1/public/registration", async (request, reply) => {
    const body = visitorRegistrationSchema.parse(request.body);

    const visitor = await prisma.visitor.upsert({
      where: { email_phone: { email: body.email, phone: body.phone } },
      create: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
      },
      update: {
        fullName: body.fullName,
      },
    });

    // Cada submissão gera um novo registro de consentimento (nunca sobrescreve o
    // anterior) — é isso que torna o histórico auditável (Seção 14 do brief).
    await prisma.visitorConsent.create({
      data: {
        visitorId: visitor.id,
        purpose: "terms",
        granted: body.termsAccepted,
        version: TERMS_VERSION,
      },
    });

    await prisma.visitorConsent.create({
      data: {
        visitorId: visitor.id,
        purpose: "marketing",
        granted: body.marketingConsent,
        version: MARKETING_VERSION,
      },
    });

    reply.code(201);
    return { visitorId: visitor.id };
  });
}
