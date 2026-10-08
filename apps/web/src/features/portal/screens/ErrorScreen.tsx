import { motion } from "motion/react";
import { WifiOff } from "lucide-react";
import type { CaptivePortalErrorReason } from "@acessanet/shared";
import { Alert, Button, Card, DemoModeBadge } from "@acessanet/ui";

const ERROR_COPY: Record<CaptivePortalErrorReason, { title: string; description: string }> = {
  AUTH_FAILED: {
    title: "Não conseguimos autorizar sua conexão",
    description: "Algo deu errado durante a autorização. Tente novamente em instantes.",
  },
  DEVICE_NOT_AUTHORIZED: {
    title: "Dispositivo não autorizado",
    description: "Não foi possível liberar o acesso para este dispositivo agora.",
  },
  AP_COMMUNICATION_FAILURE: {
    title: "Falha de comunicação",
    description: "Não conseguimos falar com o ponto de acesso Wi-Fi. Tente novamente.",
  },
  SESSION_EXPIRED: {
    title: "Sua sessão expirou",
    description: "Por segurança, você precisa refazer o cadastro para continuar.",
  },
  PORTAL_UNAVAILABLE: {
    title: "Portal temporariamente indisponível",
    description: "Estamos com instabilidade no momento. Tente novamente em instantes.",
  },
  RADIUS_UNAVAILABLE: {
    title: "Serviço de autenticação indisponível",
    description: "Não foi possível validar sua conexão agora. Tente novamente em instantes.",
  },
};

interface ErrorScreenProps {
  reason: CaptivePortalErrorReason;
  onRetry: () => void;
}

export function ErrorScreen({ reason, onRetry }: ErrorScreenProps) {
  const copy = ERROR_COPY[reason];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="flex flex-col items-center gap-5 bg-surface p-8 text-center">
        <WifiOff className="h-14 w-14 text-danger" aria-hidden />

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-text-primary">{copy.title}</h2>
          <p className="text-sm text-text-secondary">{copy.description}</p>
        </div>

        <Alert tone="danger" className="w-full text-left">
          Nenhum dado pessoal foi perdido. Você pode tentar novamente agora.
        </Alert>

        <Button size="lg" className="w-full" onClick={onRetry}>
          Tentar novamente
        </Button>
      </Card>

      <div className="mt-4 flex justify-center">
        <DemoModeBadge />
      </div>
    </motion.div>
  );
}
