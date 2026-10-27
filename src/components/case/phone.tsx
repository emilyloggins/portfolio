/**
 * The real product, running in the page: an iframe of a live build inside
 * a plain phone frame, loaded lazily. No mockup, no screenshot. The
 * caption says what to try.
 */
export function Phone({
  src,
  title,
  caption,
}: {
  src: string;
  title: string;
  caption?: string;
}) {
  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        className="overflow-hidden rounded-[2.2rem] border border-line bg-ground shadow-[0_24px_48px_-28px_rgb(28_27_25/0.45)]"
        style={{ width: 300, height: 650 }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="camera"
          className="block h-full w-full border-0"
        />
      </div>
      {caption ? <figcaption className="text-meta text-ink-2">{caption}</figcaption> : null}
    </figure>
  );
}
