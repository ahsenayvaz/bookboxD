"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({ children, pendingText = "Einen Moment …", className = "btn-primary" }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {pending ? pendingText : children}
    </button>
  );
}
