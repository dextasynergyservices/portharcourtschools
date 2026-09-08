import { cn } from "@/lib/utils";

export function DotGridAccent({
  className,
  dotColor = "#184098",
  opacity = "0.12",
}: {
  className?: string;
  dotColor?: string;
  opacity?: string;
}) {
  return (
    <svg
      className={cn("pointer-events-none absolute select-none", className)}
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={`dot-grid-${dotColor.replace("#", "")}`}
          x="0"
          y="0"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill={dotColor} fillOpacity={opacity} />
        </pattern>
      </defs>
      <rect
        width="180"
        height="180"
        fill={`url(#dot-grid-${dotColor.replace("#", "")})`}
      />
    </svg>
  );
}

export function GeometricLineAccent({
  className,
  strokeColor = "#FDDA32",
}: {
  className?: string;
  strokeColor?: string;
}) {
  return (
    <svg
      className={cn("pointer-events-none absolute select-none", className)}
      width="220"
      height="120"
      viewBox="0 0 220 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 20 H180 L220 60 H80 L40 100 H0"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeOpacity="0.25"
        strokeDasharray="4 4"
      />
      <circle cx="180" cy="20" r="3" fill={strokeColor} fillOpacity="0.4" />
      <circle cx="220" cy="60" r="3" fill={strokeColor} fillOpacity="0.4" />
      <circle cx="40" cy="100" r="3" fill={strokeColor} fillOpacity="0.4" />
    </svg>
  );
}
