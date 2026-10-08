"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmission } from "@/hooks/use-submission";
import { eventRegistrationSchema } from "@/lib/validations/submissions";

import { FormField, HoneypotField, PrivacyNote, selectClassName } from "./form-field";
import { FormStatus } from "./form-status";

export function EventRegistrationForm({
  eventSlug,
  eventTitle,
}: {
  eventSlug: string;
  eventTitle: string;
}) {
  const { status, message, fieldErrors, handleSubmit } = useSubmission(eventRegistrationSchema);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative space-y-5"
      aria-label={`Register for ${eventTitle}`}
    >
      <input type="hidden" name="type" value="event_registration" />
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <HoneypotField />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="register-name" label="Name" required errors={fieldErrors.name}>
          {(props) => <Input {...props} name="name" autoComplete="name" required maxLength={120} />}
        </FormField>
        <FormField id="register-email" label="Email" required errors={fieldErrors.email}>
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
        <FormField id="register-phone" label="Mobile number" errors={fieldErrors.phone}>
          {(props) => (
            <Input {...props} name="phone" type="tel" autoComplete="tel" maxLength={40} />
          )}
        </FormField>
        <FormField id="register-skill" label="Skill level" required errors={fieldErrors.skillLevel}>
          {(props) => (
            <select
              {...props}
              name="skillLevel"
              defaultValue=""
              required
              className={selectClassName}
            >
              <option value="">Choose your level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          )}
        </FormField>
      </div>
      <FormField
        id="register-partner"
        label="Partner's name"
        hint="For doubles. Leave blank if you'd like to be paired up."
        errors={fieldErrors.partnerName}
      >
        {(props) => <Input {...props} name="partnerName" maxLength={120} />}
      </FormField>
      <FormField id="register-notes" label="Notes for the organizer" errors={fieldErrors.notes}>
        {(props) => <Textarea {...props} name="notes" rows={3} maxLength={1000} />}
      </FormField>
      <FormStatus
        status={status}
        message={message}
        successMessage="You're on the list! The organizer will confirm your spot by email."
      />
      <PrivacyNote>
        We share your registration with the organizer so they can confirm your spot.
      </PrivacyNote>
      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="h-11 rounded-full px-6"
      >
        {status === "submitting" ? "Registering…" : "Register"}
      </Button>
    </form>
  );
}
