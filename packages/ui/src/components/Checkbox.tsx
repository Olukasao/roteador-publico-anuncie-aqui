import * as React from "react";
import { cn } from "../lib/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
}

/**
 * Checkbox de consentimento. Usado tanto para o aceite obrigatório dos termos quanto
 * para o opt-in de marketing — cada instância é independente e nunca marcada por
 * padrão (ver `defaultChecked`/`checked` fornecido pelo formulário que a consome).
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "mt-0.5 h-5 w-5 shrink-0 rounded border-surface-border text-brand-600 focus:ring-2 focus:ring-brand-400/40",
              className,
            )}
            {...props}
          />
          <span className="text-sm text-text-primary">
            {label}
            {description ? (
              <span className="mt-0.5 block text-sm text-text-secondary">{description}</span>
            ) : null}
          </span>
        </label>
        {error ? (
          <p className="pl-8 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
