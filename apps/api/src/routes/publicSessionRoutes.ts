import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { AppError } from "../errors.js";
import { prisma } from "../lib/prisma.js";
import { MOCK_OUTCOMES, mockAuthorize } from "../lib/grandstreamMock.js";

const createSessionSchema = z.object({
  visitorId: z.string().uuid(),
  // Só preenchido pelo seletor de demonstração do portal — nunca exposto num
  // ambiente de produção real conectado ao Grandstream de verdade (Fase 7/8).
  demoOutcome: z.enum(MOCK_OUTCOMES).default("success"),
});

export async function registerPublicSessionRoutes(app: FastifyInstance) {
  app.post("/api/v1/public/sessions", async (request, reply) => {
    const body = createSessionSchema.parse(request.body);

    const visitor = await prisma.visitor.findUnique({ where: { id: body.visitorId } });
    if (!visitor) {
      throw new AppError(404, "VISITOR_NOT_FOUND", "Visitante não encontrado.");
    }

    const session = await prisma.wiFiSession.create({
      data: {
        visitorId: visitor.id,
        status: "PENDING",
        networkName: "AcessaNet Wi-Fi",
      },
    });

    const result = await mockAuthorize(body.demoOutcome);

    await prisma.wiFiSession.update({
      where: { id: session.id },
      data: { status: result.status, networkName: result.networkName },
    });

    await prisma.authenticationAttempt.create({
      data: {
        sessionId: session.id,
        status: result.status,
        errorReason: result.errorReason,
      },
    });

    reply.code(result.status === "AUTHORIZED" ? 200 : 422);
    return {
      sessionId: session.id,
      status: result.status,
      errorReason: result.errorReason,
      networkName: result.networkName,
    };
  });
}
