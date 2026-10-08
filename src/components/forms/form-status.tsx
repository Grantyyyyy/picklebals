import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

export function FormStatus({
  status,
  message,
  successMessage,
}: {
  status: "idle" | "submitting" | "success" | "error";
  message: string | null;
  successMessage: string;
}) {
  if (status === "success") {
    return (
      <p
        role="status"
        className="flex items-start gap-2 rounded-xl border border-court/30 bg-court-soft p-4 text-sm text-court-deep"
      >
        <CircleCheckIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {successMessage}
      </p>
    );
  }
  if (status === "error" && message) {
    return (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
      >
        <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {message}
      </p>
    );
  }
  return null;
}
