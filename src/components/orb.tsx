"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The orb, second version: diffused light, not a drawn circle.
 *
 * Three soft bodies of cobalt drift slowly over one another on long,
 * unequal loops, under one heavy blur, so what you see is light moving
 * on paper: no edge, no outline, no texture of its own (the page's grain
 * sits over it like it sits over everything). Vibrancy comes from a
 * saturated core and from letting the bodies overlap.
 *
 * Move the pointer into it and the light runs from the cursor: a pool of
 * paper opens under the pointer (a soft radial mask on the whole layer)
 * and follows it on an eased lag, oil parting from water. A line of text
 * rides in the pool.
 */

const SIZE = 672; // px
const CORE = 0.36; // the lit body's radius, as a fraction of half the box
const POOL = 120; // px, pool radius
const FEATHER = 80; // px, how softly the pool's edge fades
const EASE = 0.12;

export function Orb() {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [time, setTime] = useState<string | null>(null);

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
      if (layer.current) {
        // The pool: transparent to `r`, fading to opaque over FEATHER.
        const m = `radial-gradient(circle at ${c.x}px ${c.y}px, transparent ${Math.max(0, c.r - FEATHER / 2)}px, black ${c.r + FEATHER / 2}px)`;
        layer.current.style.maskImage = m;
        layer.current.style.webkitMaskImage = m;
      }
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
      const within = Math.hypot(x - SIZE / 2, y - SIZE / 2) <= (SIZE / 2) * CORE + 60;
      target.current = within ? { x, y, r: POOL } : { ...target.current, r: 0 };
      setInside(within);
      wake();
    };
    const onLeave = () => {
      target.current = { ...target.current, r: 0 };
      setInside(false);
      wake();
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none fixed z-0"
      style={{ width: SIZE, height: SIZE, bottom: -SIZE * 0.42, left: -SIZE * 0.4 }}
    >
      <div ref={layer} className="orb-layer absolute inset-0">
        <div className="orb-body orb-a" />
        <div className="orb-body orb-b" />
        <div className="orb-body orb-c" />
      </div>

      <div
        ref={label}
        className="pointer-events-none absolute top-0 left-0 w-44 text-center text-[0.75rem] leading-[1.35] text-ink-2"
        style={{ opacity: 0, visibility: inside ? "visible" : "hidden" }}
      >
        <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
        <p className="mt-0.5 text-ink-3">[TODO(emily): one short sentence]</p>
      </div>
    </div>
  );
}
