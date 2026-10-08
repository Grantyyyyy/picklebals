import { cn } from "@/lib/utils";

/**
 * Regulation pickleball court seen from above, in feet × 10:
 * 44 ft long (x 0–440) × 20 ft wide (y 0–200), net at x 220,
 * non-volley "kitchen" lines 7 ft either side (x 150 / 290),
 * centerlines from each kitchen line back to the baseline.
 *
 * Each crop frames a different part of the court so surfaces
 * that use it never read as the same repeating wallpaper.
 */
const CROPS = {
  full: "-24 -24 488 248",
  kitchen: "118 -36 204 272",
  corner: "250 84 210 140",
  service: "-12 36 250 132",
  baseline: "330 -10 130 120",
} as const;

export type CourtCrop = keyof typeof CROPS;

type CourtMarkingsProps = {
  crop?: CourtCrop;
  /** Tint the kitchen the way many real courts paint it a second color. */
  kitchen?: boolean;
  /** Paint the lines in on scroll. Turn off inside fixed overlays that never scroll into view. */
  paint?: boolean;
  className?: string;
};

export function CourtMarkings({
  crop = "full",
  kitchen = true,
  paint = true,
  className,
}: CourtMarkingsProps) {
  return (
    <svg
      viewBox={CROPS[crop]}
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "pointer-events-none absolute inset-0 size-full",
        paint && "reveal-court",
        className,
      )}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {kitchen && (
        <rect
          x="150"
          y="0"
          width="140"
          height="200"
          className="fill-white/[0.045] transition-[fill] duration-500 ease-out group-hover:fill-ball/[0.14]"
        />
      )}
      <g
        className="stroke-white/[0.22]"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
      >
        <rect x="0" y="0" width="440" height="200" vectorEffect="non-scaling-stroke" />
        <line x1="150" y1="0" x2="150" y2="200" vectorEffect="non-scaling-stroke" />
        <line x1="290" y1="0" x2="290" y2="200" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="100" x2="150" y2="100" vectorEffect="non-scaling-stroke" />
        <line x1="290" y1="100" x2="440" y2="100" vectorEffect="non-scaling-stroke" />
      </g>
      {/* Net: mesh read as a fine dash, posts just outside the sidelines */}
      <line
        x1="220"
        y1="-8"
        x2="220"
        y2="208"
        className="stroke-white/30"
        strokeWidth="3"
        strokeDasharray="1 5"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="220" cy="-8" r="3" className="fill-white/35" />
      <circle cx="220" cy="208" r="3" className="fill-white/35" />
    </svg>
  );
}
