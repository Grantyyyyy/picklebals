"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSubmission } from "@/hooks/use-submission";
import { courtListingSchema } from "@/lib/validations/submissions";

import { FormField, HoneypotField, PrivacyNote, selectClassName } from "./form-field";
import { FormStatus } from "./form-status";

export function CourtListingForm() {
  const { status, message, fieldErrors, handleSubmit } = useSubmission(courtListingSchema);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="relative space-y-8"
      aria-label="List your court"
    >
      <input type="hidden" name="type" value="court_listing" />
      <HoneypotField />

      <fieldset className="space-y-5">
        <legend className="font-heading text-lg font-semibold text-court-deep">The venue</legend>
        <FormField
          id="listing-court-name"
          label="Court or venue name"
          required
          errors={fieldErrors.courtName}
        >
          {(props) => <Input {...props} name="courtName" required maxLength={160} />}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="listing-city" label="City" required errors={fieldErrors.city}>
            {(props) => (
              <Input
                {...props}
                name="city"
                required
                maxLength={80}
                placeholder="e.g. Cagayan de Oro"
              />
            )}
          </FormField>
          <FormField
            id="listing-court-count"
            label="Number of courts"
            errors={fieldErrors.courtCount}
          >
            {(props) => (
              <Input
                {...props}
                name="courtCount"
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
              />
            )}
          </FormField>
        </div>
        <FormField id="listing-address" label="Address" errors={fieldErrors.address}>
          {(props) => (
            <Input {...props} name="address" autoComplete="street-address" maxLength={300} />
          )}
        </FormField>
        <FormField id="listing-environment" label="Court type" errors={fieldErrors.environment}>
          {(props) => (
            <select {...props} name="environment" defaultValue="" className={selectClassName}>
              <option value="">Select…</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
              <option value="covered">Covered</option>
            </select>
          )}
        </FormField>
        <FormField
          id="listing-notes"
          label="Anything else?"
          hint="Hours, rates, amenities, open play schedule, social media links."
          errors={fieldErrors.notes}
        >
          {(props) => <Textarea {...props} name="notes" rows={5} maxLength={2000} />}
        </FormField>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="font-heading text-lg font-semibold text-court-deep">About you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="listing-name" label="Your name" required errors={fieldErrors.name}>
            {(props) => (
              <Input {...props} name="name" autoComplete="name" required maxLength={120} />
            )}
          </FormField>
          <FormField id="listing-role" label="Your role" required errors={fieldErrors.role}>
            {(props) => (
              <select {...props} name="role" defaultValue="" required className={selectClassName}>
                <option value="" disabled>
                  Select…
                </option>
                <option value="owner">Owner</option>
                <option value="manager">Manager / staff</option>
                <option value="player">Player</option>
              </select>
            )}
          </FormField>
          <FormField id="listing-email" label="Email" required errors={fieldErrors.email}>
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
          <FormField id="listing-phone" label="Phone" errors={fieldErrors.phone}>
            {(props) => (
              <Input {...props} name="phone" type="tel" autoComplete="tel" maxLength={40} />
            )}
          </FormField>
        </div>
      </fieldset>

      <FormStatus
        status={status}
        message={message}
        successMessage="Thanks! We received your court details and will review them before publishing."
      />
      <PrivacyNote>
        We use your details only to review this listing and follow up with you.
      </PrivacyNote>
      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="h-11 rounded-full px-6"
      >
        {status === "submitting" ? "Submitting…" : "Submit court"}
      </Button>
    </form>
  );
}
