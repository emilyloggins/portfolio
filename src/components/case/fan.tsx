import fs from "node:fs";
import path from "node:path";

/**
 * Three phone screens fanned out: the outer two tilt away, the middle one
 * sits in front. For a first look at the app rather than a close read; each
 * screen is a pre-framed image (transparent margin, its own shadow).
 * Placeholder until a file lands.
 */
export function Fan({
  screens,
  caption,
  aspect = "900 / 1833",
}: {
  screens: { src: string; alt: string }[];
  caption?: string;
  aspect?: string;
}) {
  const n = screens.length;
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex items-end justify-center px-[6%] py-4">
        {screens.map((s, i) => {
          const exists = fs.existsSync(path.join(process.cwd(), "public", s.src));
          const mid = (n - 1) / 2;
          const d = i - mid; // -1, 0, 1
          const style: React.CSSProperties = {
            width: `${100 / n + 8}%`,
            marginLeft: i === 0 ? 0 : "-8%",
            transform: `rotate(${d * 7}deg) translateY(${Math.abs(d) * 4}%) scale(${d === 0 ? 1.06 : 1})`,
            transformOrigin: "50% 100%",
            zIndex: d === 0 ? 2 : 1,
            aspectRatio: aspect,
          };
          return exists ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.src} src={`/${s.src}`} alt={s.alt} loading="lazy" style={style} className="block" />
          ) : (
            <div
              key={s.src}
              role="img"
              aria-label={s.alt}
              style={style}
              className="flex flex-col items-start justify-end gap-1 rounded-[11%/5.5%] border border-dashed border-line bg-ground p-3"
            >
              <span className="text-meta text-ink-3">{s.src}</span>
              <span className="text-meta text-ink-2">{s.alt}</span>
            </div>
          );
        })}
      </div>
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
