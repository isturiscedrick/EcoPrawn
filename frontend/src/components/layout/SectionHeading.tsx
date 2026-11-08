import type { ReactNode } from "react";

type SectionHeadingProps = {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  tone?: "default" | "inverse";
  marker?: "accent" | "zone";
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

/** Shared editorial heading used above public-page content sections. */
export function SectionHeading({
  kicker,
  title,
  description,
  id,
  tone = "default",
  marker = "accent",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: SectionHeadingProps) {
  const mutedText =
    tone === "inverse"
      ? "text-[var(--ep-on-deep-muted)]"
      : "text-[var(--ep-text-muted)]";
  const markerColor =
    marker === "zone" ? "bg-[var(--ep-zone)]" : "bg-[var(--ep-accent)]";

  return (
    <div className={className}>
      <div
        className={`mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] ${mutedText}`}
      >
        <span aria-hidden="true" className={`h-2 w-2 ${markerColor}`} />
        {kicker}
      </div>
      <h2
        id={id}
        className={`ep-font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-[1.12] tracking-tight ${titleClassName}`.trim()}
      >
        {title}
      </h2>
      {description != null && (
        <p
          className={`mt-3 max-w-[36rem] text-lg leading-relaxed ${mutedText} ${descriptionClassName}`.trim()}
        >
          {description}
        </p>
      )}
    </div>
  );
}
