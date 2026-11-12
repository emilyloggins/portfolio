"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A screen image that opens full-size in an overlay. The thumbnail is a
 * button; the overlay dims the page with the ink colour and closes on
 * click, Escape, or the close control. Motion uses the site's easing and
 * duration tokens only.
 *
 * The overlay is portalled to <body>: the page column keeps the arrival
 * animation's final `filter: blur(0)`, and any filter turns an ancestor into
 * the containing block for `position: fixed`, which pinned the overlay to the
 * article instead of the viewport.
 */
/** `bare`: the image carries its own frame (a phone shot on the page ground), so no border. */
export function Lightbox({
  src,
  alt,
  bare = false,
}: {
  src: string;
  alt: string;
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${alt} full size`}
        className={`block w-full cursor-pointer rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${bare ? "" : "border border-line"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="block w-full rounded-md" />
      </button>

      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "min(1200px, 100%)", maxHeight: "85vh" }}
                className="rounded-md shadow-2xl"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-md px-3 py-2 text-meta text-ground hover:bg-ground/10"
              >
                Close
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
