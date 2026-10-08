import type { CaptivePortalErrorReason, WiFiSessionStatus } from "@acessanet/shared";

/**
 * GrandstreamMockProvider do lado do servidor (Fase 6 — ainda sem hardware real, ver
 * packages/grandstream/README.md). Antes esta decisão vivia só no navegador
 * (apps/web/src/features/portal/mock/grandstreamMockProvider.ts); agora quem decide
 * e persiste o resultado é o backend, para a sessão/tentativa ficarem reais no banco.
 * O frontend mantém sua própria animação de passos (puramente visual) enquanto esta
 * chamada está em andamento — ver apps/web/src/features/portal/usePortalFlow.ts.
 */

export const MOCK_OUTCOMES = [
  "success",
  "rejected",
  "ap_failure",
  "radius_unavailable",
  "timeout",
  "session_expired",
  "portal_unavailable",
] as const;

export type MockOutcome = (typeof MOCK_OUTCOMES)[number];

export interface AuthorizeResult {
  status: WiFiSessionStatus;
  errorReason?: CaptivePortalErrorReason;
  networkName: string;
}

const NETWORK_NAME = "AcessaNet Wi-Fi";
const TOTAL_DELAY_MS = 1200;

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function mockAuthorize(outcome: MockOutcome): Promise<AuthorizeResult> {
  await wait(outcome === "timeout" ? TOTAL_DELAY_MS * 2 : TOTAL_DELAY_MS);

  switch (outcome) {
    case "success":
      return { status: "AUTHORIZED", networkName: NETWORK_NAME };
    case "rejected":
      return { status: "REJECTED", errorReason: "DEVICE_NOT_AUTHORIZED", networkName: NETWORK_NAME };
    case "ap_failure":
      return { status: "UNKNOWN", errorReason: "AP_COMMUNICATION_FAILURE", networkName: NETWORK_NAME };
    case "radius_unavailable":
      return { status: "UNKNOWN", errorReason: "RADIUS_UNAVAILABLE", networkName: NETWORK_NAME };
    case "timeout":
      return { status: "UNKNOWN", errorReason: "AUTH_FAILED", networkName: NETWORK_NAME };
    case "session_expired":
      return { status: "EXPIRED", errorReason: "SESSION_EXPIRED", networkName: NETWORK_NAME };
    case "portal_unavailable":
      return { status: "UNKNOWN", errorReason: "PORTAL_UNAVAILABLE", networkName: NETWORK_NAME };
  }
}
