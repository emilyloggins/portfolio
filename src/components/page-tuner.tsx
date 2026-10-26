"use client";

import { useEffect, useState } from "react";

/**
 * The page tuner, on `/?tune` only: colours, type and ground for the page
 * itself, applied live as CSS variables on <html> (which beat the token
 * file). Saved in this browser; Copy exports the values.
 */
export const PAGE_DEFAULTS = {
  ground: "#fbfaf8",
  ink: "#1c1b19",
  ink2: "#5c5a55",
  ink3: "#8c8984",
  weather: "#1c1b19", // the orb's revealed text (Brooklyn, time)
  weather2: "#8c8984", // its quieter part
  font: "inter",
  bodySize: 17, // px
  bodyLead: 1.55,
  tracking: 0, // em, body letter-spacing
  grain: 0.055, // paper grain opacity
};
type Page = typeof PAGE_DEFAULTS;

const FONTS: Record<string, { label: string; stack: string; google?: string }> = {
  inter: { label: "Inter (shipped)", stack: "var(--font-sans-var), ui-sans-serif, system-ui, sans-serif" },
  system: { label: "System sans", stack: "ui-sans-serif, system-ui, -apple-system, sans-serif" },
  helvetica: { label: "Helvetica Neue", stack: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  geist: { label: "Geist", stack: '"Geist", ui-sans-serif, sans-serif', google: "Geist:wght@300..700" },
  instrument: { label: "Instrument Sans", stack: '"Instrument Sans", ui-sans-serif, sans-serif', google: "Instrument+Sans:wght@400..700" },
  dmsans: { label: "DM Sans", stack: '"DM Sans", ui-sans-serif, sans-serif', google: "DM+Sans:wght@300..700" },
  georgia: { label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  newsreader: { label: "Newsreader", stack: '"Newsreader", Georgia, serif', google: "Newsreader:opsz,wght@6..72,300..700" },
  instrumentserif: { label: "Instrument Serif", stack: '"Instrument Serif", Georgia, serif', google: "Instrument+Serif" },
  mono: { label: "Mono", stack: "ui-monospace, SFMono-Regular, Menlo, monospace" },
};

function apply(p: Page) {
  const r = document.documentElement.style;
  r.setProperty("--color-ground", p.ground);
  r.setProperty("--color-ink", p.ink);
  r.setProperty("--color-ink-2", p.ink2);
  r.setProperty("--color-ink-3", p.ink3);
  r.setProperty("--color-weather", p.weather);
  r.setProperty("--color-weather-2", p.weather2);
  r.setProperty("--text-body", `${p.bodySize / 16}rem`);
  r.setProperty("--text-body--line-height", String(p.bodyLead));
  r.setProperty("--tracking-body", `${p.tracking}em`);
  r.setProperty("--grain", String(p.grain));
  const f = FONTS[p.font] ?? FONTS.inter;
  r.setProperty("--font-sans", f.stack);
  if (f.google && !document.getElementById(`gf-${p.font}`)) {
    const link = document.createElement("link");
    link.id = `gf-${p.font}`;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
    document.head.appendChild(link);
  }
}

export function PageTuner() {
  const [page, setPage] = useState<Page | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("tune")) return;
    let saved: Partial<Page> = {};
    try {
      saved = JSON.parse(localStorage.getItem("page-tune") ?? "{}");
    } catch {}
    const p = { ...PAGE_DEFAULTS, ...saved };
    apply(p);
    queueMicrotask(() => setPage(p));
  }, []);

  if (!page) return null;

  const set = (next: Page) => {
    apply(next);
    setPage(next);
    try {
      localStorage.setItem("page-tune", JSON.stringify(next));
    } catch {}
  };

  const colours: [keyof Page, string][] = [
    ["ground", "ground"],
    ["ink", "body"],
    ["ink2", "body quiet"],
    ["ink3", "meta"],
    ["weather", "weather text"],
    ["weather2", "weather quiet"],
  ];
  const sliders: [keyof Page, string, number, number, number][] = [
    ["bodySize", "body px", 13, 22, 0.5],
    ["bodyLead", "leading", 1.2, 1.9, 0.01],
    ["tracking", "tracking", -0.04, 0.06, 0.002],
    ["grain", "grain", 0, 0.2, 0.005],
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 max-h-[calc(100vh-2rem)] w-60 overflow-y-auto rounded-md bg-ground p-3 text-[0.75rem] text-ink shadow-[0_0_0_1px_var(--color-line),0_16px_40px_-20px_rgb(28_27_25/0.4)]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">Page</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              set({ ...PAGE_DEFAULTS });
              try {
                localStorage.removeItem("page-tune");
              } catch {}
            }}
            className="press text-ink-3 hover:text-ink"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(page, null, 2));
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

      <p className="mb-1 text-[0.6875rem] tracking-wide text-ink-3 uppercase">Colour</p>
      {colours.map(([key, label]) => (
        <label key={key} className="mb-1.5 flex items-center gap-2">
          <span className="w-20 text-ink-2">{label}</span>
          <input
            type="color"
            value={page[key] as string}
            onChange={(e) => set({ ...page, [key]: e.target.value })}
            className="h-6 w-10 cursor-pointer rounded-sm border-0 bg-transparent p-0"
          />
          <span className="tabular-nums text-ink-3">{page[key] as string}</span>
        </label>
      ))}

      <p className="mt-3 mb-1 text-[0.6875rem] tracking-wide text-ink-3 uppercase">Type</p>
      <label className="mb-1.5 flex items-center gap-2">
        <span className="w-20 text-ink-2">font</span>
        <select
          value={page.font}
          onChange={(e) => set({ ...page, font: e.target.value })}
          className="flex-1 rounded-sm bg-ground text-ink"
        >
          {Object.entries(FONTS).map(([k, f]) => (
            <option key={k} value={k}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      {sliders.map(([key, label, min, max, step]) => (
        <label key={key} className="mb-1 flex items-center gap-2">
          <span className="w-20 text-ink-2">{label}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={page[key] as number}
            onChange={(e) => set({ ...page, [key]: Number(e.target.value) })}
            className="flex-1 accent-(--color-accent)"
          />
          <span className="w-10 text-right tabular-nums text-ink-3">{page[key] as number}</span>
        </label>
      ))}
      <p className="mt-2 text-ink-3">Google fonts load on pick, for trying only; a chosen one gets self-hosted.</p>
    </div>
  );
}
