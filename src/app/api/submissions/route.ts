import { createHmac } from "node:crypto";

import { z } from "zod";

import { getSiteUrl } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import {
  HONEYPOT_FIELD,
  submissionSchema,
  type SubmissionResponse,
} from "@/lib/validations/submissions";

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function json(body: SubmissionResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host;
    return originHost === new URL(request.url).host || originHost === new URL(getSiteUrl()).host;
  } catch {
    return false;
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return json({ ok: false, error: "Cross-origin submissions are not allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "Expected a JSON body." }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Submission is too large." }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      422,
    );
  }

  const supabase = createServiceClient();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!supabase || !secret) {
    return json(
      {
        ok: false,
        error:
          "Submissions are not available yet: the database is not configured in this environment.",
      },
      503,
    );
  }

  // The secret key doubles as the HMAC key so raw IP addresses are never stored.
  const ipHash = createHmac("sha256", secret).update(clientIp(request)).digest("hex");
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error: countError } = await supabase
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", windowStart);

  if (countError) {
    console.error("Submission rate-limit check failed", countError);
    return json({ ok: false, error: "Something went wrong. Please try again later." }, 500);
  }
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return json({ ok: false, error: "Too many submissions. Please try again in an hour." }, 429);
  }

  const { type, name, email, phone, ...rest } = parsed.data;
  const details = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key !== HONEYPOT_FIELD),
  );

  const { error: insertError } = await supabase.from("submissions").insert({
    type,
    name,
    email,
    phone: phone ?? null,
    payload: details,
    ip_hash: ipHash,
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  if (insertError) {
    console.error("Submission insert failed", insertError);
    return json({ ok: false, error: "Something went wrong. Please try again later." }, 500);
  }

  return json({ ok: true }, 201);
}
