"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The Basin compare, on the page. Two photos of the same face, the earlier
 * one clipped over the later; drag anywhere on the photo to wipe. Same
 * contract as the app: the wipe lives in a CSS variable written once per
 * animation frame, so the seam stays under the finger at native frame rate
 * and React never re-renders mid-drag. Arrow keys move it for keyboards.
 */
export function CompareWipe({
  before,
  after,
  beforeLabel,
  afterLabel,
  alt,
  aspect = "4 / 5",
  initial = 50,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  alt: string;
  aspect?: string;
  initial?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef(initial);
  const [percent, setPercent] = useState(initial);
  const [touched, setTouched] = useState(false);

  const write = useCallback((p: number) => {
    const clamped = Math.min(100, Math.max(0, p));
    pendingRef.current = clamped;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      rootRef.current?.style.setProperty("--wipe", `${pendingRef.current}%`);
      setPercent(pendingRef.current);
    });
  }, []);

  const touchedRef = useRef(false);
  const sweepRef = useRef<number | null>(null);

  useEffect(() => {
    rootRef.current?.style.setProperty("--wipe", `${initial}%`);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (sweepRef.current != null) cancelAnimationFrame(sweepRef.current);
    };
  }, [initial]);

  // Once, when it first scrolls into view: sweep from the left edge to a
  // resting point on its own, then hand over. Says "this is live" before
  // anyone touches it. A touch cancels it; reduced motion skips it.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const REST = 58;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (touchedRef.current) return;
        if (reduce) {
          write(REST);
          return;
        }
        const DUR = 1500;
        const DELAY = 350;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const t0 = performance.now() + DELAY;
        const tick = (now: number) => {
          if (touchedRef.current) return;
          const t = Math.min(1, Math.max(0, (now - t0) / DUR));
          write(ease(t) * REST);
          if (t < 1) sweepRef.current = requestAnimationFrame(tick);
          else sweepRef.current = null;
        };
        write(0);
        sweepRef.current = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [write]);

  const fromEvent = (e: React.PointerEvent) => {
    const r = rectRef.current;
    if (!r || r.width === 0) return;
    write(((e.clientX - r.left) / r.width) * 100);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    rectRef.current = e.currentTarget.getBoundingClientRect();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* not every pointer type supports capture; dragging still works */
    }
    touchedRef.current = true;
    setTouched(true);
    fromEvent(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture?.(e.pointerId)) return;
    fromEvent(e);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") write(pendingRef.current - step);
    else if (e.key === "ArrowRight") write(pendingRef.current + step);
    else if (e.key === "Home") write(0);
    else if (e.key === "End") write(100);
    else return;
    e.preventDefault();
    touchedRef.current = true;
    setTouched(true);
  };

  const drag = { onPointerDown, onPointerMove };
  // On the photo itself, only a mouse drags: a finger on the photo should
  // scroll the page, not wipe, so touch goes to the slider track alone.
  const photoDrag = {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse") return;
      onPointerDown(e);
    },
    onPointerMove,
  };

  return (
    <div
      ref={rootRef}
      className="flex w-full flex-col gap-3"
      style={{ ["--wipe" as string]: `${initial}%`, ["--lime" as string]: "#d6eb6e" }}
    >
      <div
        role="presentation"
        {...photoDrag}
        style={{ aspectRatio: aspect }}
        className="relative w-full overflow-hidden rounded-md bg-ground-2 select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={after}
          alt={alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={{ transform: "translateZ(0)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: "inset(0 calc(100% - var(--wipe)) 0 0)", willChange: "clip-path" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover"
            style={{ transform: "translateZ(0)" }}
          />
        </div>

        {/* The seam: thin, unlit, marks where the photos meet. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-ground/85"
          style={{ left: "calc(var(--wipe) - 1px)" }}
        />
      </div>

      {/* The app's slider: labels either side, a track, lime fill and a lime knob.
          Lime is the one saturated colour in Basin, kept for the thing to act on. */}
      <div className="flex items-center gap-3">
        <span className="min-w-12 text-meta font-medium text-ink-2">{beforeLabel}</span>
        <div
          role="slider"
          tabIndex={0}
          aria-label={`Wipe between ${beforeLabel} and ${afterLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent)}
          aria-valuetext={`${Math.round(percent)}% toward ${afterLabel}`}
          onKeyDown={onKeyDown}
          {...drag}
          className="relative h-10 flex-1 touch-none rounded-md select-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none"
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink/12" />
          <div
            className="pointer-events-none absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full"
            style={{ width: "var(--wipe)", background: "var(--lime)" }}
          />
          <div
            className="pointer-events-none absolute top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_1px_3px_rgba(28,27,25,0.25)] ring-2 ring-ground"
            style={{ left: "var(--wipe)", background: "var(--lime)" }}
          />
        </div>
        <span className="min-w-12 text-right text-meta font-medium text-ink-2">{afterLabel}</span>
      </div>

      {/* One hint, gone on first touch. */}
      <p
        aria-hidden
        className="-mt-1 text-center text-meta text-ink-3 transition-opacity duration-(--duration-base)"
        style={{ opacity: touched ? 0 : 1 }}
      >
        Drag to compare
      </p>
    </div>
  );
}
