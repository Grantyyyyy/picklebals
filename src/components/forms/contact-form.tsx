"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmission } from "@/hooks/use-submission";
import { contactSchema } from "@/lib/validations/submissions";

import { FormField, HoneypotField } from "./form-field";
import { FormStatus } from "./form-status";

export function ContactForm() {
  const { status, message, fieldErrors, handleSubmit } = useSubmission(contactSchema);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative space-y-5"
      aria-label="Contact form"
    >
      <input type="hidden" name="type" value="contact" />
      <HoneypotField />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="contact-name" label="Name" required errors={fieldErrors.name}>
          {(props) => <Input {...props} name="name" autoComplete="name" required maxLength={120} />}
        </FormField>
        <FormField id="contact-email" label="Email" required errors={fieldErrors.email}>
          {(props) => (
            <Input
              {...props}
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          )}
        </FormField>
      </div>
      <FormField id="contact-subject" label="Subject" required errors={fieldErrors.subject}>
        {(props) => <Input {...props} name="subject" required maxLength={120} />}
      </FormField>
      <FormField id="contact-message" label="Message" required errors={fieldErrors.message}>
        {(props) => <Textarea {...props} name="message" rows={6} required maxLength={2000} />}
      </FormField>
      <FormStatus
        status={status}
        message={message}
        successMessage="Thanks for reaching out! We'll get back to you soon."
      />
      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="h-11 rounded-full px-6"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
