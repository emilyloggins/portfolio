import fs from "node:fs";
import path from "node:path";
import { Lightbox } from "./lightbox";

/**
 * A full screen or a crop from a case study. Renders the image when it
 * exists under public/work/<project>/; until then, a labelled placeholder
 * box so the page reads as a template. `aspect` keeps the placeholder the
 * shape the image will be, so the page doesn't jump when images land.
 */
export function Screen({
  src,
  alt,
  aspect = "4 / 3",
  caption,
  bare = false,
  narrow = false,
}: {
  src: string;
  alt: string;
  aspect?: string;
  caption?: string;
  /** The image carries its own frame and shadow; draw no border. */
  bare?: boolean;
  /** A single phone shot: hold it to phone width, centred. */
  narrow?: boolean;
}) {
  const exists = fs.existsSync(path.join(process.cwd(), "public", src));
  return (
    <figure className={`flex flex-col gap-2 ${narrow ? "mx-auto w-full max-w-[22rem]" : ""}`}>
      {exists ? (
        <Lightbox src={`/${src}`} alt={alt} bare={bare} />
      ) : (
        <div
          role="img"
          aria-label={alt}
          style={{ aspectRatio: aspect }}
          className="flex w-full flex-col items-start justify-end gap-1 rounded-md border border-dashed border-line p-3"
        >
          <span className="text-meta text-ink-3">{src}</span>
          <span className="text-meta text-ink-2">{alt}</span>
        </div>
      )}
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}

/** Two or three crops side by side: states of one component. */
export function Strip({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>;
}
