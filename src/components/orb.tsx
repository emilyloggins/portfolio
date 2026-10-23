"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The orb: diffused light, not a drawn circle.
 *
 * Three soft bodies of cobalt drift slowly over one another on long,
 * unequal loops under one heavy blur, so what you see is light moving on
 * paper: no edge, no outline, no texture of its own (the page's grain
 * lies over it like it lies over everything).
 *
 * Push the pointer into it and the light gives way like a liquid: each
 * body is shoved away from the cursor in proportion to how close it is
 * (so the light bulges and flows around the point rather than being cut
 * out), a bright meniscus gathers around the gap, and a small pool of
 * paper opens under the cursor for a line of text. Everything follows on
 * an eased lag and closes behind the pointer when it leaves.
 */

const SIZE = 672; // px
const CORE = 0.36; // radius of the lit body as a fraction of half the box

/**
 * The feel, in numbers. Mutable on purpose: `/?tune` shows sliders bound
 * to these so the values can be found by hand and then written here.
 */
export const TUNE = {
  pool: 92, // px, the open pool's radius
  feather: 18, // px, the pool's edge: small = a hard rim, mass displaced
  push: 110, // px, how far a body is shoved when the cursor is on it
  range: 300, // px, how far the shove reaches
  swell: 1.18, // how much the whole orb expands while the pointer is in it
  ease: 0.1, // per-frame follow; lower is lazier
  blur: 56, // px
};

export function Orb() {
  const box = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const bodies = useRef<(HTMLDivElement | null)[]>([]);
  const rim = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [inside, setInside] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const [tune, setTune] = useState(false);
  useEffect(() => {
    setTune(new URLSearchParams(window.location.search).has("tune"));
  }, []);

  // Pointer target vs. the eased position actually drawn; `r` is the pool.
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
    // While tuning, keep the loop alive so slider changes show at once.
    const tuning = new URLSearchParams(window.location.search).has("tune");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const step = () => {
      const t = target.current;
      const c = current.current;
      const k = reduced ? 1 : TUNE.ease;
      c.x += (t.x - c.x) * k;
      c.y += (t.y - c.y) * k;
      c.r += (t.r - c.r) * k;
      const strength = Math.min(1, c.r / TUNE.pool); // 0 closed .. 1 open

      // The pool. Cleared entirely once closed, so nothing lingers.
      if (layer.current) {
        const m =
          strength < 0.02
            ? "none"
            : `radial-gradient(circle at ${c.x}px ${c.y}px, transparent ${Math.max(0, c.r - TUNE.feather / 2)}px, black ${c.r + TUNE.feather / 2}px)`;
        layer.current.style.maskImage = m;
        layer.current.style.webkitMaskImage = m;
        // The whole mass swells while the pointer is in it, from its centre.
        layer.current.style.transform = `scale(${1 + (TUNE.swell - 1) * strength})`;
        layer.current.style.filter = `blur(${TUNE.blur}px) saturate(1.3)`;
      }

      // The shove: each body moves away from the pointer, more the closer it is.
      const b = box.current?.getBoundingClientRect();
      if (b) {
        for (const el of bodies.current) {
          if (!el) continue;
          const r = el.getBoundingClientRect();
          const cx = r.left + r.width / 2 - b.left;
          const cy = r.top + r.height / 2 - b.top;
          const dx = cx - c.x;
          const dy = cy - c.y;
          const d = Math.hypot(dx, dy) || 1;
          const f = Math.pow(Math.max(0, 1 - d / TUNE.range), 2) * TUNE.push * strength;
          el.style.transform = `translate(${(dx / d) * f}px, ${(dy / d) * f}px) scale(${1 + 0.12 * (f / TUNE.push)})`;
        }
      }

      // The meniscus and the text ride the eased pointer.
      if (rim.current) {
        rim.current.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%) scale(${0.6 + 0.4 * strength})`;
        rim.current.style.opacity = String(strength);
      }
      if (label.current) {
        label.current.style.transform = `translate(${c.x}px, ${c.y}px) translate(-50%, -50%)`;
        label.current.style.opacity = String(Math.max(0, (strength - 0.5) * 2));
      }

      const still =
        Math.abs(t.x - c.x) < 0.1 && Math.abs(t.y - c.y) < 0.1 && Math.abs(t.r - c.r) < 0.1;
      if (still && !tuning) {
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
      const within = Math.hypot(x - SIZE / 2, y - SIZE / 2) <= (SIZE / 2) * CORE + 40;
      // Outside: the pool closes where it is; the pointer is not tracked.
      target.current = within ? { x, y, r: TUNE.pool } : { ...target.current, r: 0 };
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
        {/* Each body: an outer wrapper takes the shove, the inner one drifts. */}
        {(["orb-a", "orb-b", "orb-c"] as const).map((cls, i) => (
          <div
            key={cls}
            ref={(el) => {
              bodies.current[i] = el;
            }}
            className={`orb-shove ${cls}`}
          >
            <div className="orb-body" />
          </div>
        ))}
        {/* The meniscus: a brighter ring of light gathered around the pool. */}
        <div ref={rim} className="orb-rim absolute top-0 left-0" style={{ opacity: 0 }} />
      </div>

      {tune ? <Tuner /> : null}

      <div
        ref={label}
        className="pointer-events-none absolute top-0 left-0 w-40 text-center text-[0.75rem] leading-[1.35] text-ink-2"
        style={{ opacity: 0, visibility: inside ? "visible" : "hidden" }}
      >
        <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
        <p className="mt-0.5 text-ink-3">[TODO(emily): one short sentence]</p>
      </div>
    </div>
  );
}

/** Sliders bound to TUNE. Only on `/?tune`. Read the numbers off, send them. */
function Tuner() {
  const [, force] = useState(0);
  const rows: [keyof typeof TUNE, number, number, number][] = [
    ["pool", 40, 200, 1],
    ["feather", 0, 160, 1],
    ["push", 0, 300, 1],
    ["range", 100, 600, 1],
    ["swell", 1, 1.6, 0.01],
    ["ease", 0.02, 0.4, 0.01],
    ["blur", 20, 110, 1],
  ];
  return (
    <div className="pointer-events-auto fixed right-4 bottom-4 z-50 w-56 rounded-md bg-ground p-3 text-[0.75rem] text-ink shadow-[0_0_0_1px_var(--color-line)]">
      {rows.map(([key, min, max, step]) => (
        <label key={key} className="mb-1.5 flex items-center gap-2">
          <span className="w-14 text-ink-2">{key}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={TUNE[key]}
            onChange={(e) => {
              TUNE[key] = Number(e.target.value);
              force((n) => n + 1);
            }}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{TUNE[key]}</span>
        </label>
      ))}
    </div>
  );
}
