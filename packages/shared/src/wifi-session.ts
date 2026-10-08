/**
 * Estados de sessão Wi-Fi (Seção 5 do prompt).
 * PENDING -> REGISTERED -> AUTHORIZING -> AUTHORIZED | REJECTED | EXPIRED
 * AUTHORIZED -> ENDED
 * Qualquer estado pode cair em UNKNOWN quando a comunicação com o AP/RADIUS falha.
 */
export const WIFI_SESSION_STATUSES = [
  "PENDING",
  "REGISTERED",
  "AUTHORIZING",
  "AUTHORIZED",
  "REJECTED",
  "EXPIRED",
  "ENDED",
  "UNKNOWN",
] as const;

export type WiFiSessionStatus = (typeof WIFI_SESSION_STATUSES)[number];

/**
 * Motivos de falha exibidos na Tela 5 (Erros). Cada um mapeia para uma mensagem
 * amigável no portal — nunca expor detalhe técnico bruto ao visitante.
 */
export const CAPTIVE_PORTAL_ERROR_REASONS = [
  "AUTH_FAILED",
  "DEVICE_NOT_AUTHORIZED",
  "AP_COMMUNICATION_FAILURE",
  "SESSION_EXPIRED",
  "PORTAL_UNAVAILABLE",
  "RADIUS_UNAVAILABLE",
] as const;

export type CaptivePortalErrorReason = (typeof CAPTIVE_PORTAL_ERROR_REASONS)[number];

/** Etapas visuais da Tela 3 (Conectando) — cada uma corresponde a um passo real do fluxo EXCAP. */
export const CONNECTING_STEPS = [
  "VERIFYING_REGISTRATION",
  "PREPARING_AUTHENTICATION",
  "AUTHORIZING_DEVICE",
  "CONFIRMING_CONNECTION",
] as const;

export type ConnectingStep = (typeof CONNECTING_STEPS)[number];
