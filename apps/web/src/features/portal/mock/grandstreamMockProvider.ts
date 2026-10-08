/**
 * Cenários de demonstração (Seção 17). A decisão de qual resultado produzir agora
 * roda no backend (apps/api/src/lib/grandstreamMock.ts) — este arquivo só guarda o
 * tipo e os rótulos usados pelo seletor de demonstração na tela de cadastro
 * (DemoScenarioPicker.tsx), para o valor escolhido ser enviado em
 * POST /api/v1/public/sessions.
 */

export type MockOutcome =
  | "success"
  | "rejected"
  | "ap_failure"
  | "radius_unavailable"
  | "timeout"
  | "session_expired"
  | "portal_unavailable";

export const MOCK_OUTCOME_LABELS: Record<MockOutcome, string> = {
  success: "Autorizado com sucesso",
  rejected: "Dispositivo não autorizado",
  ap_failure: "Falha de comunicação com o AP",
  radius_unavailable: "RADIUS indisponível",
  timeout: "Timeout na autorização",
  session_expired: "Sessão expirada",
  portal_unavailable: "Portal indisponível",
};
