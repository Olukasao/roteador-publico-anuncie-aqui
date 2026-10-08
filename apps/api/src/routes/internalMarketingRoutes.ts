import type { FastifyInstance } from "fastify";
import { AppError } from "../errors.js";
import { prisma } from "../lib/prisma.js";
import { config } from "../config.js";

/**
 * Consumida só pelo backend do Site-Acessanet (server-to-server), nunca por
 * navegador. Protegida por um Bearer token fixo de serviço — não é sessão de admin.
 * Devolve exclusivamente visitantes com consentimento de marketing ATIVO (nunca
 * revogado, nunca quem não deu opt-in) — minimização de dados por desenho, não só
 * por filtro de UI.
 */
export async function registerInternalMarketingRoutes(app: FastifyInstance) {
  app.get("/internal/marketing-leads", async (request) => {
    const authorization = request.headers.authorization;
    if (authorization !== `Bearer ${config.internalToken}`) {
      throw new AppError(401, "SERVICE_AUTH_REQUIRED", "Token de serviço inválido ou ausente.");
    }

    // Pega o consentimento de marketing MAIS RECENTE de cada visitante (não só os
    // "granted=true") e só então filtra por granted — senão um "true" antigo
    // sobreviveria a uma recusa mais recente do mesmo visitante.
    const latestPerVisitor = await prisma.visitorConsent.findMany({
      where: { purpose: "marketing", revokedAt: null },
      distinct: ["visitorId"],
      orderBy: { createdAt: "desc" },
      include: { visitor: true },
    });

    const consents = latestPerVisitor.filter((consent) => consent.granted);

    return consents.map((consent) => ({
      visitorId: consent.visitor.id,
      fullName: consent.visitor.fullName,
      email: consent.visitor.email,
      phone: consent.visitor.phone,
      establishment: consent.visitor.establishment,
      registeredAt: consent.visitor.createdAt,
      marketingConsentAt: consent.createdAt,
    }));
  });
}
