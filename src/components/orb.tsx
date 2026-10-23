"use client";

import { useEffect, useId, useState } from "react";

/**
 * The orb. A cobalt sphere in the top-right corner, diffused and grainy
 * at its edge (a displaced, blurred circle: SVG turbulence pushes the
 * edge around so it breaks up like ink on paper), breathing on a slow
 * loop. The one blue thing on the site.
 *
 * Hover or focus it and a small card unfolds beneath with a few live
 * facts; the lines Emily hasn't written yet are marked.
 */
export function Orb() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
    const tick = () => setTime(fmt.format(new Date()).toLowerCase());
    tick();
    const i = window.setInterval(tick, 30_000);
    return () => window.clearInterval(i);
  }, []);

  return (
    <div
      className="fixed top-6 right-6 z-20 flex flex-col items-end"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-card`}
        aria-label="About Emily"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="orb press relative size-28 rounded-full focus-visible:outline-none"
      >
        <svg viewBox="0 0 200 200" className="orb-svg size-full overflow-visible" aria-hidden>
          <defs>
            <filter id={`${id}-grain`} x="-40%" y="-40%" width="180%" height="180%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="noise" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="soft" />
              <feDisplacementMap in="soft" in2="noise" scale="26" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id={`${id}-fill`} cx="42%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#4a6cff" />
              <stop offset="55%" stopColor="#1f3fd1" />
              <stop offset="100%" stopColor="#1f3fd1" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="62" fill={`url(#${id}-fill)`} filter={`url(#${id}-grain)`} />
        </svg>
      </button>

      <div
        id={`${id}-card`}
        role="region"
        aria-hidden={!open}
        className="orb-card mt-1 w-56 origin-top-right rounded-md bg-ground px-4 py-3 text-meta text-ink-2 shadow-[0_1px_0_var(--color-line),0_12px_32px_-16px_rgb(28_27_25/0.35)]"
        data-open={open ? "" : undefined}
      >
        <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
        <p className="mt-1 text-ink-3">[TODO(emily): one line on what you are open to]</p>
        <p className="mt-1 text-ink-3">[TODO(emily): one line, anything]</p>
      </div>
    </div>
  );
}
