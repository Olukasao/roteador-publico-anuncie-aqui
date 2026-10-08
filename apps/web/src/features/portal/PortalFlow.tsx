import { AnimatePresence } from "motion/react";
import { PortalShell } from "./PortalShell";
import { usePortalFlow } from "./usePortalFlow";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { RegistrationScreen } from "./screens/RegistrationScreen";
import { ConnectingScreen } from "./screens/ConnectingScreen";
import { ConnectedScreen } from "./screens/ConnectedScreen";
import { ErrorScreen } from "./screens/ErrorScreen";

/**
 * Orquestra as 5 telas do captive portal `/wifi` (Seção 4). Hoje roda inteiramente
 * contra o GrandstreamMockProvider — quando o backend real (Fase 6+) existir, só o
 * hook `usePortalFlow` muda (troca o mock por chamadas HTTP), as telas permanecem.
 */
export function PortalFlow() {
  const flow = usePortalFlow();

  return (
    <PortalShell>
      <AnimatePresence mode="wait">
        {flow.screen === "welcome" && (
          <WelcomeScreen key="welcome" onConnect={flow.goToRegistration} />
        )}
        {flow.screen === "registration" && (
          <RegistrationScreen
            key="registration"
            onBack={flow.goToWelcome}
            onSubmit={flow.submitRegistration}
          />
        )}
        {flow.screen === "connecting" && (
          <ConnectingScreen key="connecting" currentStep={flow.currentStep} />
        )}
        {flow.screen === "connected" && (
          <ConnectedScreen
            key="connected"
            networkName={flow.networkName}
            // Em produção, isto chama window.location.assign(origUrl) com a URL que o
            // visitante tentava acessar antes do redirecionamento EXCAP (Seção 5).
            // Sem contexto real nesta fase mockada, apenas confirmamos o estado na tela.
            onBrowse={() => {}}
          />
        )}
        {flow.screen === "error" && flow.errorReason && (
          <ErrorScreen key="error" reason={flow.errorReason} onRetry={flow.retryConnection} />
        )}
      </AnimatePresence>
    </PortalShell>
  );
}
