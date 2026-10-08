import { publicEnv } from "@/lib/env";

export const MEDIA_BUCKET = "media";

/** Builds the public URL for an object in the public media bucket (no network call). */
export function getMediaUrl(path: string | null | undefined): string | null {
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  if (/^https?:\/\//.test(path)) return path;
  const encoded = path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}
