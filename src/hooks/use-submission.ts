"use client";

import { useState, type FormEvent } from "react";
import { z } from "zod";

import type { FieldErrors, SubmissionResponse } from "@/lib/validations/submissions";

type Status = "idle" | "submitting" | "success" | "error";

/** Validates a form against `schema` on the client, then posts it to the submissions endpoint. */
export function useSubmission<Schema extends z.ZodType>(schema: Schema) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(
      [...new FormData(form).entries()]
        .filter(([, value]) => typeof value === "string" && value !== "")
        .map(([key, value]) => [key, value]),
    );

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setStatus("error");
      setMessage("Please correct the highlighted fields.");
      setFieldErrors(z.flattenError(parsed.error).fieldErrors as FieldErrors);
      return;
    }

    setStatus("submitting");
    setMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as SubmissionResponse;
      if (result.ok) {
        setStatus("success");
        form.reset();
        return;
      }
      setStatus("error");
      setMessage(result.error);
      setFieldErrors(result.fieldErrors ?? {});
    } catch {
      setStatus("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return { status, message, fieldErrors, handleSubmit };
}
