import { z } from "zod";

/** Hidden field that real users never fill in. Bots that do are rejected. */
export const HONEYPOT_FIELD = "homepage";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const contactFields = {
  name: z.string().trim().min(2, "Please enter your name.").max(120),
  email: z.email("Please enter a valid email address.").trim().max(254),
  phone: optionalText(40),
  [HONEYPOT_FIELD]: z.string().max(0, "Invalid submission.").optional(),
};

export const courtListingSchema = z.object({
  type: z.literal("court_listing"),
  ...contactFields,
  role: z.enum(["owner", "manager", "player"], { error: "Please choose your role." }),
  courtName: z.string().trim().min(2, "Please enter the court or venue name.").max(160),
  city: z.string().trim().min(2, "Please enter the city.").max(80),
  address: optionalText(300),
  courtCount: z.coerce
    .number({ error: "Enter a number." })
    .int()
    .min(1, "At least 1 court.")
    .max(50)
    .optional(),
  environment: z.enum(["indoor", "outdoor", "covered"]).optional(),
  notes: optionalText(2000),
});

export const contactSchema = z.object({
  type: z.literal("contact"),
  ...contactFields,
  subject: z.string().trim().min(2, "Please add a subject.").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(2000, "Please keep your message under 2000 characters."),
});

export const submissionSchema = z.discriminatedUnion("type", [courtListingSchema, contactSchema]);

export type CourtListingInput = z.infer<typeof courtListingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type SubmissionInput = z.infer<typeof submissionSchema>;

export type FieldErrors = Partial<Record<string, string[]>>;

export type SubmissionResponse =
  { ok: true } | { ok: false; error: string; fieldErrors?: FieldErrors };
