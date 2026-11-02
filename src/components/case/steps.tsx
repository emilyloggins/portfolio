/**
 * The onboarding, laid out as a gallery: three photographs, a numeral in
 * the project's own colour, and the line each step says in the app.
 * Used once, on Basin, to explain the method before the screens.
 */
export function Steps({
  steps,
}: {
  steps: { image: string; alt: string; text: string }[];
}) {
  return (
    <ol className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-4">
      {steps.map((s, i) => (
        <li key={s.image} className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/${s.image}`}
            alt={s.alt}
            loading="lazy"
            className="aspect-[4/5] w-full rounded-md object-cover"
          />
          <div className="flex items-baseline gap-3">
            <span
              aria-hidden
              className="text-meta font-medium tabular-nums"
              style={{ color: "color-mix(in oklab, var(--color-thread, var(--color-ink-3)) 55%, var(--color-ink))" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-body font-medium text-ink text-balance">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
