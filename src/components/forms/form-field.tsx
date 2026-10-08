import Link from "next/link";
import { type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { HONEYPOT_FIELD } from "@/lib/validations/submissions";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
};

/** Label, control, hint and error message wired together for screen readers. */
export function FormField({ id, label, required, hint, errors, children }: FormFieldProps) {
  const error = errors?.[0];
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="font-normal text-muted-foreground">(optional)</span>
        )}
      </Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen trap field; hidden from users and assistive technology. */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
      <input
        id={HONEYPOT_FIELD}
        name={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

export const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

/** Point-of-collection notice: what happens to the details in this form. */
export function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      {children}{" "}
      <Link href="/privacy" className="font-medium text-court underline underline-offset-4">
        Privacy policy
      </Link>
    </p>
  );
}
