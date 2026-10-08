import * as React from "react";
import { cn } from "../lib/cn";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-surface-border bg-surface shadow-soft",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
