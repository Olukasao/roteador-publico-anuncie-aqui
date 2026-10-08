import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const alertVariants = cva("flex items-start gap-3 rounded-md border p-4 text-sm", {
  variants: {
    tone: {
      danger: "border-danger/30 bg-danger/5 text-danger",
      warning: "border-warning/30 bg-warning/5 text-warning",
      info: "border-brand-300 bg-brand-50 text-brand-800",
    },
  },
  defaultVariants: {
    tone: "info",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

export function Alert({ className, tone, icon, children, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ tone }), className)} {...props}>
      {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
      <div className="flex-1">{children}</div>
    </div>
  );
}
