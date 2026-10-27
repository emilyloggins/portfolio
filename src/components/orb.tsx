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
  size: 125, // px, the orb at rest
  count: 3000, // dots
  dot: 1.4, // px, dot radius
  density: 0.72, // how the dots pack: lower = denser centre, grainier rim
  spread: 1.11, // rim raggedness (1 = clean circle)
  alphaMin: 0.76, // faintest dot
  color: "#0a2fc2",
  color2: "#132dbe", // second tone
  color3: "#0b1f7a", // third tone
  tones: 1, // 1, 2 or 3 colours in play
  toneBy: 1, // 1 = tones run from centre (color) to rim (color2/3); 0 = scattered at random
  toneBlend: 1, // 1 = smooth blend between tones; 0 = hard bands
  // breathing
  breathe: 0.02, // how much it swells
  breatheSec: 4.2, // seconds per breath
  // resting motion: each dot wanders around its home on its own slow loop
  wander: 5.8, // px, how far a dot strays at rest
  wanderSpeed: 0.12, // loops per second-ish; lower is lazier
  swirl: -4, // slow rotation of the whole cloud, degrees per second (0 = still)
  // weather (live from Brooklyn; the tuner can override)
  weatherLive: 1, // 1 = use the real weather, 0 = use the sliders below
  wind: 0, // km/h
  windDir: 270, // degrees the wind comes FROM (meteorological)
  rain: 0, // mm in the last hour
  temp: 15, // °C
  windPush: 0.012, // how much wind leans the resting dots, per km/h
  windGust: 0.02, // how much wind bends the scatter
  rainFall: 0, // downward pull per mm (Emily: off for now)
  rainJitter: 0, // extra jitter per mm (off)
  coldGrey: 0, // how grey the colour goes below 5°C (off)
  heatTight: 0, // how much tighter the cloud packs per 10°C above 20 (off)
  // scatter
  enter: 1.15, // how far outside the orb the cursor counts as "in" (× radius)
  throwForce: 2.4, // how hard a dot is thrown from the cursor
  throwRange: 140, // px, how far the throw reaches
  drift: 0.004, // slow outward drift while the cursor stays
  jitter: 0.4, // random motion while scattered
  scatterDamping: 0.9, // 1 = no friction; lower settles faster
  // return
  spring: 0.045, // pull toward home
  returnDamping: 0.4, // lower = settles faster, higher = bouncier
  // field
  room: 330, // px, canvas; dots fade before reaching its edge
  fade: 38, // px, how wide the fade-out band at the edge is
  // text
  textDelay: 710, // ms after scatter begins
};
export type Tune = typeof DEFAULTS;

/** The colour for a dot at `u` (0 centre .. 1 rim) under the tone settings. */
function tone(T: Tune, u: number): string {
  const n = Math.round(T.tones);
  if (n <= 1) return T.color;
  const stops = n === 2 ? [T.color, T.color2] : [T.color, T.color2, T.color3];
  const pos = u * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(pos));
  const k = pos - i;
  if (T.toneBlend < 0.5) return k < 0.5 ? stops[i] : stops[i + 1];
  return mix(stops[i], stops[i + 1], k);
}

/** Blend two hex colours; `k` toward the second. */
function mix(a: string, b: string, k: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
}

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; a: number; p: number; q: number; f: number; col: string };

export function Orb() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tune = useRef<Tune>({ ...DEFAULTS });
  /** The real weather in Brooklyn, when it has loaded. */
  const live = useRef<{ wind: number; windDir: number; rain: number; temp: number } | null>(null);
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

  // Brooklyn's weather, from Open-Meteo (no key, CORS open), cached for
  // 30 minutes in this browser. Nothing in the UI says it is happening;
  // the dots just behave like the day does.
  useEffect(() => {
    const KEY = "orb-weather";
    try {
      const cached = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
      if (cached && Date.now() - cached.at < 30 * 60_000) {
        live.current = cached.w;
        return;
      }
    } catch {}
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=40.73&longitude=-73.95&current=temperature_2m,precipitation,wind_speed_10m,wind_direction_10m&timezone=America%2FNew_York";
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const c = j.current;
        const w = {
          wind: Number(c.wind_speed_10m) || 0,
          windDir: Number(c.wind_direction_10m) || 0,
          rain: Number(c.precipitation) || 0,
          temp: Number(c.temperature_2m) || 15,
        };
        live.current = w;
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), w }));
        } catch {}
      })
      .catch(() => {});
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
        // Where this dot sits on the tone ramp: by radius, or at random.
        const u = T.toneBy >= 0.5 ? Math.min(1, r / R) : Math.random();
        return {
          hx, hy, x: hx, y: hy, vx: 0, vy: 0,
          col: tone(T, u),
          a: T.alphaMin + Math.random() * (1 - T.alphaMin),
          p: Math.random() * Math.PI * 2, // wander phase, x
          q: Math.random() * Math.PI * 2, // wander phase, y
          f: 0.6 + Math.random() * 0.8, // wander rate, per dot
        };
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

      // The weather: live, or the sliders.
      const W = T.weatherLive >= 0.5 && live.current ? live.current : { wind: T.wind, windDir: T.windDir, rain: T.rain, temp: T.temp };
      // Wind blows TOWARD windDir + 180; canvas y is down.
      const blow = ((W.windDir + 180) * Math.PI) / 180;
      const wx = Math.sin(blow) * W.wind;
      const wy = -Math.cos(blow) * W.wind;
      const tight = 1 - Math.max(0, (W.temp - 20) / 10) * T.heatTight; // hotter packs tighter
      const cold = Math.min(1, Math.max(0, (5 - W.temp) / 10)) * T.coldGrey; // below 5°C, greyer
      const swirl = reduced ? 0 : (T.swirl * Math.PI / 180) * t;
      const cs = Math.cos(swirl), sn = Math.sin(swirl);

      ctx.clearRect(0, 0, T.room, T.room);
      let lastCol = "";
      for (const d of dots) {
        const col = cold > 0 ? mix(d.col, "#8a8f9c", cold) : d.col;
        if (col !== lastCol) { ctx.fillStyle = col; lastCol = col; }
        // Home, breathed, tightened by heat, turned by the swirl, then
        // wandering on its own slow loop, then leaning with the wind.
        let ox = (d.hx - C) * breathe * tight;
        let oy = (d.hy - C) * breathe * tight;
        if (swirl) { const rx = ox * cs - oy * sn; oy = ox * sn + oy * cs; ox = rx; }
        const wobble = reduced ? 0 : T.wander;
        const hx = C + ox + Math.sin(t * T.wanderSpeed * d.f * Math.PI * 2 + d.p) * wobble + wx * T.windPush * 10;
        const hy = C + oy + Math.cos(t * T.wanderSpeed * d.f * Math.PI * 2 * 0.8 + d.q) * wobble + wy * T.windPush * 10 + W.rain * T.rainFall * 10;
        if (pointer.in) {
          const dx = d.x - pointer.x;
          const dy = d.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const f = Math.max(0, 1 - dist / T.throwRange) * T.throwForce;
          const jit = T.jitter + W.rain * T.rainJitter;
          // Wind and rain ride the throw (scaled by `f`), never as a
          // standing force: a hovered cloud must not sail off downwind.
          d.vx += (dx / dist) * f + (d.x - C) * T.drift + (Math.random() - 0.5) * jit + wx * T.windGust * f;
          d.vy += (dy / dist) * f + (d.y - C) * T.drift + (Math.random() - 0.5) * jit + wy * T.windGust * f + W.rain * T.rainFall * f;
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
          <p className="text-weather">Brooklyn, NY{time ? <span className="text-weather-2"> · {time}</span> : null}</p>
          <p className="mt-0.5 w-36 text-weather-2">[TODO(emily): one short sentence]</p>
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
    title: "Tones",
    rows: [
      ["tones", "tones", 1, 3, 1, true],
      ["toneBy", "by radius", 0, 1, 1, true],
      ["toneBlend", "blend", 0, 1, 1, true],
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
    title: "Resting motion",
    rows: [
      ["wander", "wander", 0, 20, 0.1],
      ["wanderSpeed", "wander speed", 0, 2, 0.01],
      ["swirl", "swirl °/s", -30, 30, 0.5],
    ],
  },
  {
    title: "Weather (set live to 0 to override)",
    rows: [
      ["weatherLive", "live", 0, 1, 1],
      ["wind", "wind km/h", 0, 80, 1],
      ["windDir", "wind from °", 0, 360, 5],
      ["rain", "rain mm", 0, 10, 0.1],
      ["temp", "temp °C", -15, 40, 1],
      ["windPush", "wind lean", 0, 0.1, 0.001],
      ["windGust", "wind gust", 0, 0.2, 0.002],
      ["rainFall", "rain pull", 0, 0.4, 0.005],
      ["rainJitter", "rain jitter", 0, 1.5, 0.01],
      ["coldGrey", "cold grey", 0, 1, 0.01],
      ["heatTight", "heat tight", 0, 0.5, 0.01],
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
    <div className="fixed bottom-4 left-4 z-50 max-h-[calc(100vh-2rem)] w-64 overflow-y-auto rounded-md bg-ground p-3 text-[0.75rem] text-ink shadow-[0_0_0_1px_var(--color-line),0_16px_40px_-20px_rgb(28_27_25/0.4)]">
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
      {(["color", "color2", "color3"] as const).map((key, i) => (
        <label key={key} className="mb-1.5 flex items-center gap-2">
          <span className="w-16 text-ink-2">{["tone 1", "tone 2", "tone 3"][i]}</span>
          <input
            type="color"
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value }, true)}
            className="h-6 w-10 cursor-pointer rounded-sm border-0 bg-transparent p-0"
          />
          <span className="tabular-nums text-ink-3">{value[key]}</span>
        </label>
      ))}
      <div className="mb-3" />
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
