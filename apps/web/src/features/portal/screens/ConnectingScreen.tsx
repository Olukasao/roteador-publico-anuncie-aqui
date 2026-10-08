import { motion } from "motion/react";
import { CONNECTING_STEPS, type ConnectingStep } from "@acessanet/shared";
import { Card, ConnectionStepper, DemoModeBadge } from "@acessanet/ui";

const STEP_LABELS: Record<ConnectingStep, string> = {
  VERIFYING_REGISTRATION: "Verificando cadastro",
  PREPARING_AUTHENTICATION: "Preparando autenticação",
  AUTHORIZING_DEVICE: "Autorizando dispositivo",
  CONFIRMING_CONNECTION: "Confirmando conexão",
};

interface ConnectingScreenProps {
  currentStep: ConnectingStep;
}

export function ConnectingScreen({ currentStep }: ConnectingScreenProps) {
  const currentIndex = CONNECTING_STEPS.indexOf(currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="flex flex-col items-center gap-6 bg-surface p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary">Conectando você…</h2>
        <p className="-mt-3 text-sm text-text-secondary">
          Isso leva só alguns segundos.
        </p>

        <div className="w-full text-left">
          <ConnectionStepper
            steps={CONNECTING_STEPS.map((id) => ({ id, label: STEP_LABELS[id] }))}
            currentIndex={currentIndex}
          />
        </div>
      </Card>

      <div className="mt-4 flex justify-center">
        <DemoModeBadge />
      </div>
    </motion.div>
  );
}
