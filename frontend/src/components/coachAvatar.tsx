// src/components/coachAvatar.tsx
import type { CoachPersona } from "@/personas/personas";

type Size = "sm" | "md" | "lg" | "xl";

const frameSize: Record<Size, string> = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
};

const innerSize: Record<Size, string> = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export default function CoachAvatar({
  persona,
  size = "lg",
  showLabel = false,
  className = "",
  labelPlacement = "right",
}: {
  persona?: CoachPersona; // made optional for runtime safety
  size?: Size;
  showLabel?: boolean;
  className?: string;
  labelPlacement?: "right" | "bottom";
}) {
  const Avatar = persona?.Avatar;

  return (
    <figure
      className={[
        "inline-flex",
        labelPlacement === "right"
          ? "items-center gap-3"
          : "flex-col items-center gap-2",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "relative grid place-items-center rounded-2xl",
          "bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-emerald-500/15",
          "ring-1 ring-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur",
          frameSize[size],
        ].join(" ")}
        aria-label={persona?.name ?? "Coach avatar"}
        role="img"
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/3 to-transparent" />
        {Avatar ? (
          <Avatar className={[innerSize[size], "rounded-xl"].join(" ")} />
        ) : (
          // ultra-light fallback if persona missing — prevents runtime crash/white screen
          <div
            className={[
              innerSize[size],
              "rounded-xl bg-white/10 ring-1 ring-white/10",
            ].join(" ")}
          />
        )}
      </div>

      {showLabel && persona && (
        <figcaption
          className={
            "text-xs leading-tight text-white/85 " +
            (labelPlacement === "right" ? "" : "text-center")
          }
        >
          <div className="font-semibold text-white">{persona.name}</div>
          {persona.short && (
            <div className="text-white/70">{persona.short}</div>
          )}
        </figcaption>
      )}
    </figure>
  );
}
