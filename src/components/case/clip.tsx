import fs from "node:fs";
import path from "node:path";

/**
 * A short, muted, looping screen recording in the same frame as the stills:
 * device corner radius, hairline edge, soft shadow, sized by container
 * query units so it matches a framed Screen at any width. Placeholder until
 * the file lands in public/.
 */
export function Clip({
  src,
  alt,
  caption,
  aspect = "1170 / 2532",
  narrow = true,
}: {
  src: string;
  alt: string;
  caption?: string;
  aspect?: string;
  narrow?: boolean;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));
  return (
    <figure className={`@container flex flex-col gap-2 ${narrow ? "mx-auto w-full max-w-[22rem]" : ""}`}>
      <div className="w-full" style={{ padding: "5.5cqw" }}>
        {exists ? (
          <video
            src={`/${src}`}
            aria-label={alt}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{
              aspectRatio: aspect,
              borderRadius: "10.7cqw",
              boxShadow: "0 0 0 1px var(--color-line), 0 18px 40px -12px rgba(28, 27, 25, 0.28)",
            }}
            className="block w-full bg-ground-2 object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            style={{ aspectRatio: aspect, borderRadius: "10.7cqw" }}
            className="flex w-full flex-col items-start justify-end gap-1 border border-dashed border-line p-3"
          >
            <span className="text-meta text-ink-3">{src}</span>
            <span className="text-meta text-ink-2">{alt}</span>
          </div>
        )}
      </div>
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
