import { motion } from "motion/react";
import { ShieldCheck, Wifi } from "lucide-react";
import { Button, Card, DemoModeBadge } from "@acessanet/ui";

interface WelcomeScreenProps {
  onConnect: () => void;
}

export function WelcomeScreen({ onConnect }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <Card className="flex flex-col items-center gap-6 bg-surface p-8 text-center">
        <img
          src="/brand/logo-acessanet-dark-text.png"
          alt="AcessaNet"
          width={120}
          height={120}
          className="h-20 w-20 object-contain"
        />

        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center justify-center gap-1.5 self-center rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <Wifi className="h-3.5 w-3.5" aria-hidden />
            Wi-Fi gratuito
          </span>
          <h1 className="text-2xl font-bold text-text-primary">
            Conecte-se ao que importa.
          </h1>
          <p className="text-sm text-text-secondary">
            Internet gratuita AcessaNet. Cadastre-se em segundos e navegue com
            tranquilidade.
          </p>
        </div>

        <Button size="lg" className="w-full" onClick={onConnect}>
          Conectar gratuitamente
        </Button>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden />
          Conexão segura · seus dados protegidos
        </div>

        <a
          href="/wifi/privacidade"
          className="text-xs text-text-secondary underline underline-offset-2 hover:text-brand-600"
        >
          Política de privacidade
        </a>
      </Card>

      <div className="mt-4 flex justify-center">
        <DemoModeBadge />
      </div>
    </motion.div>
  );
}
