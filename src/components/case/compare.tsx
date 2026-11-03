import fs from "node:fs";
import path from "node:path";
import { CompareWipe } from "./compare-wipe";

/**
 * The Basin compare as a figure. Server side it checks both photos exist
 * under public/; until they do, a placeholder the same shape holds the spot.
 */
export function Compare({
  before,
  after,
  beforeLabel,
  afterLabel,
  alt,
  aspect = "4 / 5",
  caption,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
  aspect?: string;
  caption?: string;
}) {
  const ready = [before, after].every((p) =>
    fs.existsSync(path.join(process.cwd(), "public", p)),
  );
  return (
    <figure className="mx-auto flex w-full max-w-[22rem] flex-col gap-2 self-end">
      {ready ? (
        <CompareWipe
          before={`/${before}`}
          after={`/${after}`}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
          alt={alt}
          aspect={aspect}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          style={{ aspectRatio: aspect }}
          className="flex w-full flex-col items-start justify-end gap-1 rounded-md border border-dashed border-line p-3"
        >
          <span className="text-meta text-ink-3">
            {before} + {after}
          </span>
          <span className="text-meta text-ink-2">{alt}</span>
        </div>
      )}
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
