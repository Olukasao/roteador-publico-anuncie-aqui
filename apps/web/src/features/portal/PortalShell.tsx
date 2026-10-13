import type { ReactNode } from "react";

interface PortalShellProps {
  children: ReactNode;
  topSlot?: ReactNode;
}

/**
 * Moldura visual compartilhada pelas 5 telas do portal: fundo navy institucional com
 * um glow discreto, card central mobile-first. Mantida leve (sem blur pesado) porque
 * roda dentro do navegador de captive portal do iOS/Android (Seção 16). Altura em
 * dvh com fallback e padding respeitando safe-area (notch/home indicator).
 */
export function PortalShell({ children, topSlot }: PortalShellProps) {
  return (
    <div className="h-screen-safe portal-safe-padding relative flex flex-col items-center justify-center overflow-x-hidden bg-brand-950">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% 0%, rgba(37,125,255,0.22) 0%, rgba(6,21,45,0) 70%), " +
            "radial-gradient(45% 35% at 85% 85%, rgba(147,197,253,0.08) 0%, rgba(6,21,45,0) 70%), " +
            "linear-gradient(180deg, #06152D 0%, #0a2250 55%, #06152D 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 py-6">
        {topSlot}
        {children}
      </div>
    </div>
  );
}
