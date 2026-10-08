import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONNECTING_STEPS,
  type CaptivePortalErrorReason,
  type ConnectingStep,
  type VisitorRegistrationInput,
} from "@acessanet/shared";
import { createWifiSession, registerVisitor } from "../../lib/api";
import type { MockOutcome } from "./mock/grandstreamMockProvider";

export type PortalScreenName = "welcome" | "registration" | "connecting" | "connected" | "error";

// Passos puramente visuais (Tela 3) — não vêm mais do mock local, só dão ritmo à UI
// enquanto a chamada real ao backend (apps/api) está em andamento.
const STEP_PACE_MS = 650;

export function usePortalFlow() {
  const [screen, setScreen] = useState<PortalScreenName>("welcome");
  const [currentStep, setCurrentStep] = useState<ConnectingStep>(CONNECTING_STEPS[0]);
  const [errorReason, setErrorReason] = useState<CaptivePortalErrorReason | null>(null);
  const [networkName, setNetworkName] = useState("AcessaNet Wi-Fi");
  const [lastOutcome, setLastOutcome] = useState<MockOutcome>("success");
  const lastRegistration = useRef<VisitorRegistrationInput | null>(null);
  const lastVisitorId = useRef<string | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
  }, []);

  const goToRegistration = useCallback(() => setScreen("registration"), []);

  const goToWelcome = useCallback(() => {
    setScreen("welcome");
    setErrorReason(null);
  }, []);

  const startStepAnimation = useCallback(() => {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    let index = 0;
    setCurrentStep(CONNECTING_STEPS[0]);
    stepTimerRef.current = setInterval(() => {
      index = Math.min(index + 1, CONNECTING_STEPS.length - 1);
      setCurrentStep(CONNECTING_STEPS[index] ?? CONNECTING_STEPS[0]);
    }, STEP_PACE_MS);
  }, []);

  const stopStepAnimation = useCallback(() => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const authorize = useCallback(
    async (visitorId: string, forcedOutcome: MockOutcome) => {
      setScreen("connecting");
      setErrorReason(null);
      startStepAnimation();

      try {
        const result = await createWifiSession(visitorId, forcedOutcome);
        stopStepAnimation();

        if (result.status === "AUTHORIZED") {
          setNetworkName(result.networkName);
          setScreen("connected");
        } else {
          setErrorReason((result.errorReason as CaptivePortalErrorReason) ?? "AUTH_FAILED");
          setScreen("error");
        }
      } catch {
        stopStepAnimation();
        setErrorReason("PORTAL_UNAVAILABLE");
        setScreen("error");
      }
    },
    [startStepAnimation, stopStepAnimation],
  );

  const submitRegistration = useCallback(
    async (data: VisitorRegistrationInput, forcedOutcome: MockOutcome = "success") => {
      lastRegistration.current = data;
      setLastOutcome(forcedOutcome);
      setScreen("connecting");
      setErrorReason(null);
      startStepAnimation();

      try {
        const { visitorId } = await registerVisitor(data);
        lastVisitorId.current = visitorId;
        await authorize(visitorId, forcedOutcome);
      } catch {
        stopStepAnimation();
        setErrorReason("PORTAL_UNAVAILABLE");
        setScreen("error");
      }
    },
    [authorize, startStepAnimation, stopStepAnimation],
  );

  const retryConnection = useCallback(() => {
    if (!lastVisitorId.current) {
      setScreen("registration");
      return;
    }
    void authorize(lastVisitorId.current, lastOutcome);
  }, [authorize, lastOutcome]);

  return {
    screen,
    currentStep,
    errorReason,
    networkName,
    goToRegistration,
    goToWelcome,
    submitRegistration,
    retryConnection,
  };
}
