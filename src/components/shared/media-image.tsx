import Image from "next/image";

import { cn } from "@/lib/utils";

type MediaImageProps = {
  src: string | null;
  alt: string;
  sizes: string;
  /** Preload in `<head>`; use only for a single above-the-fold (LCP) image. */
  preload?: boolean;
  /** Use `"eager"` for above-the-fold images in grids, where several could be the LCP. */
  loading?: "eager" | "lazy";
  className?: string;
  /** Short label rendered on the placeholder when there is no image. */
  label?: string;
};

/** Optimized image with a branded court-pattern placeholder when no image is available. */
export function MediaImage({
  src,
  alt,
  sizes,
  preload,
  loading,
  className,
  label,
}: MediaImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-court", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          preload={preload}
          loading={preload ? undefined : loading}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0" role="img" aria-label={alt}>
          <svg
            viewBox="0 0 400 240"
            preserveAspectRatio="xMidYMid slice"
            className="size-full"
            aria-hidden="true"
          >
            <rect width="400" height="240" className="fill-court" />
            <g className="stroke-white/35" strokeWidth="3" fill="none">
              <rect x="40" y="30" width="320" height="180" />
              <line x1="200" y1="30" x2="200" y2="210" />
              <line x1="150" y1="30" x2="150" y2="210" />
              <line x1="250" y1="30" x2="250" y2="210" />
              <line x1="40" y1="120" x2="150" y2="120" />
              <line x1="250" y1="120" x2="360" y2="120" />
            </g>
            <circle cx="300" cy="70" r="16" className="fill-ball" />
          </svg>
          {label && (
            <span className="absolute bottom-3 left-3 rounded-full bg-court-deep/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
