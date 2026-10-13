import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { PortalShell } from "./PortalShell";
import { PortalIntro } from "./PortalIntro";
import { usePortalFlow } from "./usePortalFlow";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { RegistrationScreen } from "./screens/RegistrationScreen";
import { ConnectingScreen } from "./screens/ConnectingScreen";
import { ConnectedScreen } from "./screens/ConnectedScreen";
import { ErrorScreen } from "./screens/ErrorScreen";

function prefersReducedMotion() {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Orquestra as 5 telas do captive portal `/wifi` (Seção 4). Hoje roda inteiramente
 * contra o GrandstreamMockProvider — quando o backend real (Fase 6+) existir, só o
 * hook `usePortalFlow` muda (troca o mock por chamadas HTTP), as telas permanecem.
 */
export function PortalFlow() {
  const flow = usePortalFlow();
  // A marca abre o portal toda vez que o cliente entra na rede (cada carregamento de
  // /wifi). Com "reduzir movimento" ligado, a abertura é só a tela estática da logo.
  const [showIntro, setShowIntro] = useState(true);
  const [staticIntro] = useState(prefersReducedMotion);

  const finishIntro = () => setShowIntro(false);

  return (
    <PortalShell>
      <AnimatePresence mode="wait">
        {showIntro && <PortalIntro key="intro" onComplete={finishIntro} staticOnly={staticIntro} />}
        {!showIntro && flow.screen === "welcome" && (
          <WelcomeScreen key="welcome" onConnect={flow.goToRegistration} />
        )}
        {!showIntro && flow.screen === "registration" && (
          <RegistrationScreen
            key="registration"
            onBack={flow.goToWelcome}
            onSubmit={flow.submitRegistration}
          />
        )}
        {!showIntro && flow.screen === "connecting" && (
          <ConnectingScreen key="connecting" currentStep={flow.currentStep} />
        )}
        {!showIntro && flow.screen === "connected" && (
          <ConnectedScreen
            key="connected"
            networkName={flow.networkName}
            // Em produção, isto chama window.location.assign(origUrl) com a URL que o
            // visitante tentava acessar antes do redirecionamento EXCAP (Seção 5).
            // Sem contexto real nesta fase mockada, apenas confirmamos o estado na tela.
            onBrowse={() => {}}
          />
        )}
        {!showIntro && flow.screen === "error" && flow.errorReason && (
          <ErrorScreen key="error" reason={flow.errorReason} onRetry={flow.retryConnection} />
        )}
      </AnimatePresence>
    </PortalShell>
  );
}
