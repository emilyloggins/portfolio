"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * A list whose hover highlight is ONE object that slides between rows,
 * rather than each row tinting on its own. Pointer moves over a row ->
 * the pill moves and resizes to that row (250ms, decelerating, no
 * overshoot); pointer leaves the list -> the pill fades where it is.
 * Entering the list places the pill on the first row touched WITHOUT
 * sliding (it fades in there); only moves between rows slide.
 * Keyboard focus drives it the same way.
 */
type Pill = { top: number; height: number; visible: boolean; instant: boolean };

export function List({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<Pill>({ top: 0, height: 0, visible: false, instant: true });

  const track = (target: EventTarget | null) => {
    const list = ref.current;
    const row = (target as HTMLElement | null)?.closest<HTMLElement>("[data-row]");
    if (!list || !row) return;
    const l = list.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    setPill((prev) => ({
      top: r.top - l.top,
      height: r.height,
      visible: true,
      // Arriving from hidden: jump into place, then fade in.
      instant: !prev.visible,
    }));
  };

  const hide = () => setPill((prev) => ({ ...prev, visible: false }));

  return (
    <div
      ref={ref}
      className="relative"
      onPointerMove={(e) => track(e.target)}
      onPointerLeave={hide}
      onFocusCapture={(e) => track(e.target)}
      onBlurCapture={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) hide();
      }}
    >
      <div
        aria-hidden
        className="pill pointer-events-none absolute -inset-x-3 rounded-sm bg-ground-2"
        style={{
          top: 0,
          height: pill.height,
          opacity: pill.visible ? 1 : 0,
          transform: `translateY(${pill.top}px)`,
          transition: pill.instant
            ? "opacity 160ms var(--ease-out)"
            : "transform 250ms var(--ease-out), height 250ms var(--ease-out), opacity 160ms var(--ease-out)",
        }}
      />
      <div className="relative flex flex-col">{children}</div>
    </div>
  );
}
