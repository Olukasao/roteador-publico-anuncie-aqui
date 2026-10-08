import { cn } from "../lib/cn";

export interface StepperItem {
  id: string;
  label: string;
}

export interface ConnectionStepperProps {
  steps: StepperItem[];
  currentIndex: number;
  failedIndex?: number | null;
}

/** Progressão vertical usada na Tela 3 (Conectando) — reflete o estado real do fluxo. */
export function ConnectionStepper({ steps, currentIndex, failedIndex }: ConnectionStepperProps) {
  return (
    <ol className="flex flex-col gap-4" aria-label="Progresso da conexão">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFailed = failedIndex === index;

        return (
          <li key={step.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors duration-300",
                isDone && "border-success bg-success text-white",
                isCurrent && !isFailed && "border-brand-500 text-brand-600",
                isFailed && "border-danger bg-danger text-white",
                !isDone && !isCurrent && "border-surface-border text-muted-400",
              )}
              aria-hidden
            >
              {isDone ? "✓" : isFailed ? "!" : index + 1}
            </span>
            <span
              className={cn(
                "text-sm transition-colors duration-300",
                (isCurrent || isDone) && !isFailed && "font-medium text-text-primary",
                isFailed && "font-medium text-danger",
                !isDone && !isCurrent && "text-text-secondary",
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {step.label}
            </span>
            {isCurrent && !isFailed ? (
              <span
                className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
                aria-hidden
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
