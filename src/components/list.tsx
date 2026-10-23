"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * A list whose hover highlight is ONE object that slides between rows,
 * rather than each row tinting on its own. Pointer moves over a row ->
 * the pill moves and resizes to that row (250ms, decelerating, no
 * overshoot); pointer leaves the list -> the pill fades where it is.
 * Keyboard focus drives it the same way. Rows stay plain links; the
 * pill is painted underneath them.
 */
export function List({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ top: number; height: number } | null>(null);

  const track = (target: EventTarget | null) => {
    const list = ref.current;
    const row = (target as HTMLElement | null)?.closest<HTMLElement>("[data-row]");
    if (!list || !row) return;
    const l = list.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    setPill({ top: r.top - l.top, height: r.height });
  };

  return (
    <div
      ref={ref}
      className="relative"
      onPointerMove={(e) => track(e.target)}
      onPointerLeave={() => setPill(null)}
      onFocusCapture={(e) => track(e.target)}
      onBlurCapture={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setPill(null);
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-3 rounded-sm bg-ground-2"
        style={{
          top: 0,
          height: pill?.height ?? 0,
          opacity: pill ? 1 : 0,
          transform: `translateY(${pill?.top ?? 0}px)`,
          transition: pill
            ? "transform 250ms var(--ease-out), height 250ms var(--ease-out), opacity 160ms var(--ease-out)"
            : "opacity 160ms var(--ease-out)",
        }}
      />
      <div className="relative flex flex-col">{children}</div>
    </div>
  );
}
