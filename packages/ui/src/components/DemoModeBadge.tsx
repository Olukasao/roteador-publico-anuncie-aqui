/**
 * Indicador obrigatório (Seção 17) sempre que o fluxo estiver usando o
 * GrandstreamMockProvider, para nunca confundir dado simulado com integração real.
 */
export function DemoModeBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning ${className ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
      Modo demonstração — sem conexão real com o access point
    </span>
  );
}
