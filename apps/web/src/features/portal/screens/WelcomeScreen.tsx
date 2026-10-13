import { motion } from "motion/react";
import { ShieldCheck, Wifi } from "lucide-react";
import { Button, DemoModeBadge } from "@acessanet/ui";

interface WelcomeScreenProps {
  onConnect: () => void;
}

export function WelcomeScreen({ onConnect }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex w-full flex-1 flex-col items-center justify-center gap-8 text-center"
    >
      <motion.img
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        src="/brand/logo-acessanet-light-text-sm.png"
        alt="AcessaNet"
        width={220}
        height={82}
        className="h-14 w-auto object-contain"
      />

      <div className="flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-brand-200">
          <Wifi className="h-3.5 w-3.5" aria-hidden />
          Wi-Fi gratuito
        </span>
        <h1 className="text-[1.75rem] font-bold leading-tight text-white">
          Conecte-se ao que importa.
        </h1>
        <p className="max-w-[26ch] text-sm text-white/60">
          Internet gratuita AcessaNet. Conecte-se em segundos e aproveite.
        </p>
      </div>

      <div className="flex w-full flex-col items-center gap-5">
        <Button size="lg" className="w-full" onClick={onConnect}>
          Conectar gratuitamente
        </Button>
      </div>

      <footer className="flex flex-col items-center gap-2 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-300" aria-hidden />
          Conexão segura · seus dados protegidos
        </div>
        <div className="flex items-center gap-3 text-xs text-white/35">
          <a href="/wifi/privacidade" className="underline-offset-2 hover:text-white/60 hover:underline">
            Política de privacidade
          </a>
          <span aria-hidden>·</span>
          <a href="/wifi/termos" className="underline-offset-2 hover:text-white/60 hover:underline">
            Termos de uso
          </a>
        </div>
        <p className="text-[11px] text-white/25">Powered by AcessaNet</p>
      </footer>

      {import.meta.env.DEV ? <DemoModeBadge /> : null}
    </motion.div>
  );
}
