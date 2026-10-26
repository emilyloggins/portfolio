"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The orb: a small cobalt sphere in the top-right corner made of dots,
 * dense at the centre and thinning to grain at the rim, breathing on a
 * slow loop. Pointer in: the dots scatter from the cursor and a line of
 * text takes the orb's place. Pointer out: every dot eases home.
 *
 * Every number that makes the feel lives in `DEFAULTS`. On `/?tune` a
 * control panel edits a live copy of them; "Copy" puts the current
 * values on the clipboard so they can be pasted back here.
 */

export const DEFAULTS = {
  // shape
  size: 112, // px, the orb at rest
  count: 720, // dots
  dot: 1.6, // px, dot radius
  density: 0.62, // how the dots pack: lower = denser centre, grainier rim
  spread: 1.1, // rim raggedness (1 = clean circle)
  alphaMin: 0.55, // faintest dot
  color: "#1f3fd1",
  // breathing
  breathe: 0.035, // how much it swells
  breatheSec: 5.2, // seconds per breath
  // scatter
  enter: 1.15, // how far outside the orb the cursor counts as "in" (× radius)
  throwForce: 2.4, // how hard a dot is thrown from the cursor
  throwRange: 140, // px, how far the throw reaches
  drift: 0.004, // slow outward drift while the cursor stays
  jitter: 0.4, // random motion while scattered
  scatterDamping: 0.9, // 1 = no friction; lower settles faster
  // return
  spring: 0.06, // pull toward home
  returnDamping: 0.78, // lower = settles faster, higher = bouncier
  // field
  room: 640, // px, canvas; dots fade before reaching its edge
  fade: 90, // px, how wide the fade-out band at the edge is
  // text
  textDelay: 260, // ms after scatter begins
};
export type Tune = typeof DEFAULTS;

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number };

export function Orb() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tune = useRef<Tune>({ ...DEFAULTS });
  const [panel, setPanel] = useState<Tune | null>(null);
  const [inside, setInside] = useState(false);
  const [time, setTime] = useState<string | null>(null);
  const rebuild = useRef(0);

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

  // `/?tune` opens the panel, restoring the last values from this browser.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("tune")) return;
    let saved: Partial<Tune> = {};
    try {
      saved = JSON.parse(localStorage.getItem("orb-tune") ?? "{}");
    } catch {}
    tune.current = { ...DEFAULTS, ...saved };
    rebuild.current++;
    queueMicrotask(() => setPanel({ ...tune.current }));
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dots: Dot[] = [];
    let built = -1;
    let dpr = 1;
    const build = () => {
      const T = tune.current;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      el.width = T.room * dpr;
      el.height = T.room * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const C = T.room / 2;
      const R = T.size / 2;
      dots = Array.from({ length: T.count }, () => {
        const t = Math.random();
        const r = R * Math.pow(t, T.density) * (1 + (Math.random() - 0.5) * (T.spread - 1) * 2);
        const ang = Math.random() * Math.PI * 2;
        const hx = C + Math.cos(ang) * r;
        const hy = C + Math.sin(ang) * r;
        return { hx, hy, x: hx, y: hy, vx: 0, vy: 0, a: T.alphaMin + Math.random() * (1 - T.alphaMin) };
      });
      built = rebuild.current;
    };

    const pointer = { x: 0, y: 0, in: false };
    let raf = 0;
    const t0 = performance.now();

    const draw = (now: number) => {
      const T = tune.current;
      if (built !== rebuild.current) build();
      const C = T.room / 2;
      const t = (now - t0) / 1000;
      const breathe = reduced ? 1 : 1 + T.breathe * Math.sin((t * Math.PI * 2) / T.breatheSec);
      ctx.clearRect(0, 0, T.room, T.room);
      ctx.fillStyle = T.color;
      for (const d of dots) {
        const hx = C + (d.hx - C) * breathe;
        const hy = C + (d.hy - C) * breathe;
        if (pointer.in) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const f = Math.max(0, 1 - dist / T.throwRange) * T.throwForce;
          d.vx += (dx / dist) * f + (d.x - C) * T.drift + (Math.random() - 0.5) * T.jitter;
          d.vy += (dy / dist) * f + (d.y - C) * T.drift + (Math.random() - 0.5) * T.jitter;
          d.vx *= T.scatterDamping;
          d.vy *= T.scatterDamping;
        } else {
          d.vx += (hx - d.x) * T.spring;
          d.vy += (hy - d.y) * T.spring;
          d.vx *= T.returnDamping;
          d.vy *= T.returnDamping;
        }
        d.x += d.vx;
        d.y += d.vy;
        const edge = Math.min(d.x, d.y, T.room - d.x, T.room - d.y);
        const fade = Math.min(1, Math.max(0, (edge - 10) / T.fade));
        if (fade <= 0) continue;
        ctx.globalAlpha = d.a * fade;
        ctx.beginPath();
        ctx.arc(d.x, d.y, T.dot, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const onMove = (e: PointerEvent) => {
      const T = tune.current;
      const b = el.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      const C = T.room / 2;
      const dist = Math.hypot(x - C, y - C);
      const within = dist <= (T.size / 2) * T.enter;
      const stay = pointer.in && dist <= T.room / 2;
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

  const T = panel ?? DEFAULTS;
  const room = panel ? panel.room : DEFAULTS.room;
  const size = panel ? panel.size : DEFAULTS.size;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed z-20"
        style={{ width: room, height: room, top: 24 - (room - size) / 2, right: 24 - (room - size) / 2 }}
      >
        <canvas ref={canvas} style={{ width: room, height: room }} />
        <div
          className="orb-text absolute inset-0 flex flex-col items-center justify-center text-center text-[0.75rem] leading-[1.35] text-ink-2"
          data-open={inside ? "" : undefined}
          style={{ transitionDelay: inside ? `${T.textDelay}ms` : "120ms" }}
        >
          <p className="text-ink">Brooklyn, NY{time ? <span className="text-ink-3"> · {time}</span> : null}</p>
          <p className="mt-0.5 w-36 text-ink-3">[TODO(emily): one short sentence]</p>
        </div>
      </div>

      {panel ? (
        <Panel
          value={panel}
          onChange={(next, structural) => {
            tune.current = next;
            if (structural) rebuild.current++;
            setPanel(next);
            try {
              localStorage.setItem("orb-tune", JSON.stringify(next));
            } catch {}
          }}
          onReset={() => {
            tune.current = { ...DEFAULTS };
            rebuild.current++;
            setPanel({ ...DEFAULTS });
            try {
              localStorage.removeItem("orb-tune");
            } catch {}
          }}
        />
      ) : null}
    </>
  );
}

/* ---------- the panel ---------- */

type Row = [keyof Tune, string, number, number, number, boolean?]; // key, label, min, max, step, structural

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Shape",
    rows: [
      ["size", "size", 40, 320, 1, true],
      ["count", "dots", 50, 3000, 10, true],
      ["dot", "dot size", 0.5, 5, 0.1],
      ["density", "density", 0.2, 1.5, 0.01, true],
      ["spread", "rim ragged", 1, 1.6, 0.01, true],
      ["alphaMin", "faintest", 0.05, 1, 0.01, true],
    ],
  },
  {
    title: "Breathing",
    rows: [
      ["breathe", "swell", 0, 0.2, 0.005],
      ["breatheSec", "seconds", 1, 15, 0.1],
    ],
  },
  {
    title: "Scatter",
    rows: [
      ["enter", "enter zone", 0.5, 3, 0.05],
      ["throwForce", "throw", 0, 10, 0.1],
      ["throwRange", "reach", 20, 400, 1],
      ["drift", "drift", 0, 0.03, 0.0005],
      ["jitter", "jitter", 0, 3, 0.05],
      ["scatterDamping", "friction", 0.5, 1, 0.005],
    ],
  },
  {
    title: "Return",
    rows: [
      ["spring", "spring", 0.005, 0.3, 0.005],
      ["returnDamping", "bounce", 0.3, 0.98, 0.005],
    ],
  },
  {
    title: "Field",
    rows: [
      ["room", "room", 200, 1200, 10, true],
      ["fade", "edge fade", 0, 300, 1],
      ["textDelay", "text delay", 0, 1500, 10],
    ],
  },
];

function Panel({
  value,
  onChange,
  onReset,
}: {
  value: Tune;
  onChange: (next: Tune, structural: boolean) => void;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-[calc(100vh-2rem)] w-64 overflow-y-auto rounded-md bg-ground p-3 text-[0.75rem] text-ink shadow-[0_0_0_1px_var(--color-line),0_16px_40px_-20px_rgb(28_27_25/0.4)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Orb</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onReset}
            className="press text-ink-3 hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
              } catch {}
            }}
            className="press text-ink-3 hover:text-ink"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <label className="mb-3 flex items-center gap-2">
        <span className="w-16 text-ink-2">color</span>
        <input
          type="color"
          value={value.color}
          onChange={(e) => onChange({ ...value, color: e.target.value }, false)}
          className="h-6 w-10 cursor-pointer rounded-sm border-0 bg-transparent p-0"
        />
        <span className="tabular-nums text-ink-3">{value.color}</span>
      </label>
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-3">
          <p className="mb-1 text-[0.6875rem] tracking-wide text-ink-3 uppercase">{g.title}</p>
          {g.rows.map(([key, label, min, max, step, structural]) => (
            <label key={key} className="mb-1 flex items-center gap-2">
              <span className="w-16 truncate text-ink-2">{label}</span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[key] as number}
                onChange={(e) =>
                  onChange({ ...value, [key]: Number(e.target.value) }, Boolean(structural))
                }
                className="flex-1 accent-(--color-accent)"
              />
              <span className="w-12 text-right tabular-nums text-ink-3">
                {value[key] as number}
              </span>
            </label>
          ))}
        </div>
      ))}
      <p className="text-ink-3">Hover the orb while you drag. Copy sends me the numbers.</p>
    </div>
  );
}
