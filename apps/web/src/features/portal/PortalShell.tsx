import type { ReactNode } from "react";

interface PortalShellProps {
  children: ReactNode;
  topSlot?: ReactNode;
}

/**
 * Moldura visual compartilhada pelas 5 telas do portal: fundo navy institucional com
 * um glow discreto, card central mobile-first. Mantida leve (sem blur pesado) porque
 * roda dentro do navegador de captive portal do iOS/Android (Seção 16).
 */
export function PortalShell({ children, topSlot }: PortalShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-brand-950 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(56,189,248,0.18) 0%, rgba(6,20,45,0) 70%), linear-gradient(180deg, #06142d 0%, #0b2d5c 100%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6">
        {topSlot}
        {children}
      </div>
    </div>
  );
}
