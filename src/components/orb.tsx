"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * The orb. A large cobalt sphere spilling off the top-right corner,
 * diffused and grainy at its edge (a blurred circle whose edge is pushed
 * around by SVG turbulence, so it breaks up like ink on paper), breathing
 * on a slow loop. The one blue thing on the site.
 *
 * Move the mouse into it and the blue runs from the cursor: a pool of
 * paper opens under the pointer and follows it, oil parting from water,
 * with the same grainy edge. A small block of text rides in the pool.
 * Everything moves on an eased follow (lerp per frame), never snaps.
 */

const SIZE = 448; // px, the orb's box
const R = 0.62; // the sphere's radius as a fraction of half the box
const POOL = 150; // px, the open pool's radius
const EASE = 0.14; // per-frame follow; lower is lazier

export function Orb() {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const hole = useRef<SVGCircleElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  // Target and current pointer position (box px) and pool radius.
  const target = useRef({ x: SIZE / 2, y: SIZE / 2, r: 0 });
  const current = useRef({ x: SIZE / 2, y: SIZE / 2, r: 0 });

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

  // The follow loop. Runs while anything is still moving, then sleeps.
  useEffect(() => {
    let raf = 0;
    let running = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = () => {
      const t = target.current;
      const c = current.current;
      const k = reduced ? 1 : EASE;
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
      c.r += (t.r - c.r) * k;
      // Box px -> viewBox units (200 across the box).
      const s = 200 / SIZE;
      hole.current?.setAttribute("cx", String(c.x * s));
      hole.current?.setAttribute("cy", String(c.y * s));
      hole.current?.setAttribute("r", String(c.r * s));
      if (label.current) {
        label.current.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
        label.current.style.opacity = String(Math.min(1, c.r / POOL));
      }
      const still =
        Math.abs(t.x - c.x) < 0.1 && Math.abs(t.y - c.y) < 0.1 && Math.abs(t.r - c.r) < 0.1;
      if (still) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    const wake = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(step);
    };
    const el = box.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const dx = x - SIZE / 2;
      const dy = y - SIZE / 2;
      const within = Math.hypot(dx, dy) <= (SIZE / 2) * R + 24;
      target.current = { x, y, r: within ? POOL : 0 };
      setInside(within);
      wake();
    };
    const onLeave = () => {
      target.current = { ...target.current, r: 0 };
      setInside(false);
      wake();
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={box}
      aria-hidden
      className="orb pointer-events-auto fixed z-20"
      style={{ width: SIZE, height: SIZE, top: -SIZE * 0.34, right: -SIZE * 0.3 }}
    >
      <svg viewBox="0 0 200 200" className="orb-svg size-full overflow-visible">
        <defs>
          <filter id={`${id}-grain`} x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="3" result="noise" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="soft" />
            <feDisplacementMap in="soft" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <radialGradient id={`${id}-fill`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#4a6cff" />
            <stop offset="55%" stopColor="#1f3fd1" />
            <stop offset="100%" stopColor="#1f3fd1" stopOpacity="0.6" />
          </radialGradient>
          {/* The pool: a soft-edged hole cut out of the sphere. The mask is
              applied INSIDE the grain filter's group, so the pool's edge
              gets the same displacement and breaks up the same way. */}
          <mask id={`${id}-pool`}>
            <rect width="200" height="200" fill="white" />
            <circle ref={hole} cx="100" cy="100" r="0" fill="black" filter={`url(#${id}-feather)`} />
          </mask>
          <filter id={`${id}-feather`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g filter={`url(#${id}-grain)`}>
          <g mask={`url(#${id}-pool)`}>
            <circle cx="100" cy="100" r={100 * R} fill={`url(#${id}-fill)`} />
          </g>
        </g>
      </svg>

      {/* The text in the pool. Rides the eased pointer; fades with the
          pool's radius so it never appears before there is room for it. */}
      <div
        ref={label}
        className="pointer-events-none absolute top-0 left-0 w-56 text-center text-meta text-ink-2"
        style={{ opacity: 0, visibility: inside ? "visible" : "hidden" }}
      >
        <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
        <p className="mt-1 text-ink-3">[TODO(emily): a sentence or two for the pool]</p>
      </div>
    </div>
  );
}
