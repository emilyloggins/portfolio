"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The orb, small again: a cobalt sphere in the top-left corner made of
 * dots. A few hundred points packed densely at the centre and thinning
 * toward the rim, so the edge is grain rather than a line; the whole
 * thing breathes on a slow loop.
 *
 * When the pointer comes in, the dots scatter: each one is thrown away
 * from the cursor and keeps drifting while the cursor stays, and a line
 * of text appears where the orb was. When the pointer leaves, every dot
 * eases back to its place. All on canvas; nothing is a DOM node.
 */

const SIZE = 112; // px, the orb at rest
const CANVAS = 320; // px, room to scatter into
const COUNT = 720;
const DOT = 1.6; // px radius at rest

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number };

export function Orb() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [inside, setInside] = useState(false);
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

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    el.width = CANVAS * dpr;
    el.height = CANVAS * dpr;
    ctx.scale(dpr, dpr);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const C = CANVAS / 2;
    const R = SIZE / 2;

    // Home positions: dense in the middle, sparse at the rim (sqrt bias
    // inverted), so the edge thins out into grain.
    const dots: Dot[] = Array.from({ length: COUNT }, () => {
      const t = Math.random();
      const r = R * Math.pow(t, 0.62) * (0.92 + Math.random() * 0.22);
      const ang = Math.random() * Math.PI * 2;
      const hx = C + Math.cos(ang) * r;
      const hy = C + Math.sin(ang) * r;
      return { hx, hy, x: hx, y: hy, vx: 0, vy: 0, a: 0.55 + Math.random() * 0.45 };
    });

    const pointer = { x: 0, y: 0, in: false };
    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const breathe = reduced ? 1 : 1 + 0.035 * Math.sin(t * (Math.PI * 2) / 5.2);
      ctx.clearRect(0, 0, CANVAS, CANVAS);
      ctx.fillStyle = "#1f3fd1";
      for (const d of dots) {
        const hx = C + (d.hx - C) * breathe;
        const hy = C + (d.hy - C) * breathe;
        if (pointer.in) {
          // Scatter: thrown from the cursor, hard when near, plus a slow
          // outward drift so the cloud keeps opening while the cursor stays.
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const f = Math.max(0, 1 - dist / 140) * 2.4;
          d.vx += (dx / dist) * f + (d.x - C) * 0.004 + (Math.random() - 0.5) * 0.4;
          d.vy += (dy / dist) * f + (d.y - C) * 0.004 + (Math.random() - 0.5) * 0.4;
          d.vx *= 0.9;
          d.vy *= 0.9;
        } else {
          // Return: a spring to home, damped so it settles without bounce.
          d.vx += (hx - d.x) * 0.06;
          d.vy += (hy - d.y) * 0.06;
          d.vx *= 0.78;
          d.vy *= 0.78;
        }
        d.x += d.vx;
        d.y += d.vy;
        // Keep them on the canvas.
        d.x = Math.min(CANVAS - 2, Math.max(2, d.x));
        d.y = Math.min(CANVAS - 2, Math.max(2, d.y));
        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.arc(d.x, d.y, DOT, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const within = Math.hypot(x - C, y - C) <= R * 1.15;
      // Once in, stay "in" while the pointer is anywhere over the cloud.
      const stay = pointer.in && Math.hypot(x - C, y - C) <= CANVAS / 2;
      pointer.x = x;
      pointer.y = y;
      pointer.in = within || stay;
      setInside(pointer.in);
    };
    const onLeave = () => {
      pointer.in = false;
      setInside(false);
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-20"
      style={{
        width: CANVAS,
        height: CANVAS,
        top: 24 - (CANVAS - SIZE) / 2,
        left: 24 - (CANVAS - SIZE) / 2,
      }}
    >
      <canvas ref={canvas} style={{ width: CANVAS, height: CANVAS }} />
      {/* The text takes the orb's place as the dots leave it. */}
      <div
        className="orb-text absolute inset-0 flex flex-col items-center justify-center text-center text-[0.75rem] leading-[1.35] text-ink-2"
        data-open={inside ? "" : undefined}
      >
        <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
        <p className="mt-0.5 w-36 text-ink-3">[TODO(emily): one short sentence]</p>
      </div>
    </div>
  );
}
