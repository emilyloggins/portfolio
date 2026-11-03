import fs from "node:fs";
import path from "node:path";

/**
 * Three phone screens fanned out: the outer two tilt away, the middle one
 * sits in front. For a first look at the app rather than a close read; each
 * screen is a pre-framed image (transparent margin, its own shadow).
 * Every slot is the same fixed width so the fan holds its shape whether a
 * slot holds the image or, until the file lands, a placeholder.
 */
export function Fan({
  screens,
  caption,
  aspect = "900 / 1886",
}: {
  screens: { src: string; alt: string }[];
  caption?: string;
  aspect?: string;
}) {
  const n = screens.length;
  const mid = (n - 1) / 2;
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-center justify-center py-6">
        {screens.map((s, i) => {
          const exists = fs.existsSync(path.join(process.cwd(), "public", s.src));
          const d = i - mid; // -1, 0, 1
          return (
            <div
              key={s.src}
              className="flex-none"
              style={{
                width: "38%",
                marginLeft: i === 0 ? 0 : "-11%",
                // Outer two identical: same width, same scale, mirrored tilt.
                transform: `rotate(${d * 6}deg) translateY(${Math.abs(d) * 3}%) scale(${d === 0 ? 1.08 : 0.94})`,
                transformOrigin: "50% 60%",
                zIndex: d === 0 ? 2 : 1,
                position: "relative",
              }}
            >
              {exists ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/${s.src}`} alt={s.alt} loading="lazy" style={{ aspectRatio: aspect }} className="block w-full" />
              ) : (
                <div
                  role="img"
                  aria-label={s.alt}
                  style={{ aspectRatio: aspect }}
                  className="flex w-full flex-col items-start justify-end gap-1 overflow-hidden rounded-[11%/5.5%] border border-dashed border-line bg-ground p-3"
                >
                  <span className="text-meta text-ink-3">{s.src}</span>
                  <span className="text-meta text-ink-2">{s.alt}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
