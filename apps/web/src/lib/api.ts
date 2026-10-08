import type { VisitorRegistrationInput } from "@acessanet/shared";
import type { MockOutcome } from "../features/portal/mock/grandstreamMockProvider";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("NETWORK_ERROR");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok && response.status !== 422) {
    throw new ApiError(payload?.code ?? "UNKNOWN_ERROR");
  }

  return payload as T;
}

export interface RegisterVisitorResponse {
  visitorId: string;
}

export function registerVisitor(data: VisitorRegistrationInput) {
  return postJson<RegisterVisitorResponse>("/api/v1/public/registration", data);
}

export interface CreateSessionResponse {
  sessionId: string;
  status: string;
  errorReason?: string;
  networkName: string;
}

export function createWifiSession(visitorId: string, demoOutcome: MockOutcome) {
  return postJson<CreateSessionResponse>("/api/v1/public/sessions", { visitorId, demoOutcome });
}
