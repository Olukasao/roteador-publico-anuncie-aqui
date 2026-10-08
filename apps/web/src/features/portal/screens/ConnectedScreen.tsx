import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Alert, Button, Card, DemoModeBadge } from "@acessanet/ui";

interface ConnectedScreenProps {
  networkName: string;
  onBrowse: () => void;
}

export function ConnectedScreen({ networkName, onBrowse }: ConnectedScreenProps) {
  const [browseConfirmed, setBrowseConfirmed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="flex flex-col items-center gap-5 bg-surface p-8 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        >
          <CheckCircle2 className="h-16 w-16 text-success" aria-hidden />
        </motion.div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-text-primary">Você está conectado!</h2>
          <p className="text-sm text-text-secondary">Rede: {networkName}</p>
        </div>

        <p className="text-sm text-text-secondary">
          Aproveite a internet gratuita AcessaNet. Bom navegar!
        </p>

        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            setBrowseConfirmed(true);
            onBrowse();
          }}
        >
          Começar a navegar
        </Button>

        {browseConfirmed ? (
          <Alert tone="info" className="w-full text-left">
            Conexão liberada — você já pode navegar normalmente neste dispositivo.
          </Alert>
        ) : null}

        {/* Área reservada para banners/campanhas (Fase 9 — Seção 11) */}
        <div className="w-full rounded-md border border-dashed border-surface-border p-4 text-xs text-text-secondary">
          Espaço reservado para ofertas e novidades AcessaNet
        </div>
      </Card>

      <div className="mt-4 flex justify-center">
        <DemoModeBadge />
      </div>
    </motion.div>
  );
}
