"use client";

import { useEffect, useRef, useState } from "react";
import { Stage } from "./stage";

/**
 * Enrollment, step What, rebuilt live: products chosen against COVERAGE,
 * not by count. Heartworm and flea and tick are required, intestinal
 * parasite is optional. One product per coverage; choosing another
 * replaces it. A combo fills every coverage it covers and locks the
 * others' rows while it's selected. Continue with a required coverage
 * empty puts the reason under that row, in words. The monthly total is
 * one computed number: plan plus add-ons, with its cadence.
 */
type Coverage = "heartworm" | "fleaTick" | "intestinal";
type Product = { id: string; name: string; band: string; covers: Coverage[] };

const COVERAGES: { id: Coverage; label: string; required: boolean }[] = [
  { id: "heartworm", label: "Heartworm", required: true },
  { id: "fleaTick", label: "Flea and tick", required: true },
  { id: "intestinal", label: "Intestinal parasite", required: false },
];

const PRODUCTS: Product[] = [
  { id: "heartgard", name: "Heartgard Plus", band: "0 to 25 lb", covers: ["heartworm"] },
  { id: "interceptor", name: "Interceptor Plus", band: "8.1 to 25 lb", covers: ["heartworm", "intestinal"] },
  { id: "nexgard", name: "NexGard", band: "10.1 to 24 lb", covers: ["fleaTick"] },
  { id: "bravecto", name: "Bravecto", band: "9.9 to 22 lb", covers: ["fleaTick"] },
  { id: "trio", name: "Simparica Trio", band: "11.1 to 22 lb", covers: ["heartworm", "fleaTick", "intestinal"] },
  { id: "drontal", name: "Drontal Plus", band: "2 to 25 lb", covers: ["intestinal"] },
];

const PLAN = 58;
const ADDONS = [
  { id: "nails", name: "Nail trims", price: 6, cadence: "per month" },
  { id: "puppy", name: "Puppy", price: 14, cadence: "per month" },
];

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

/** A number that settles rather than swaps. */
function Settle({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 280);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(start + (value - start) * e);
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{money(shown)}</>;
}

export function CoveragePicker() {
  const [chosen, setChosen] = useState<string[]>(["heartgard"]);
  const [addons, setAddons] = useState<string[]>([]);
  const [tried, setTried] = useState(false);

  const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  const coverageOf = (c: Coverage) => chosen.map(byId).find((p) => p.covers.includes(c));
  const lockedBy = (c: Coverage) => {
    const p = coverageOf(c);
    return p && p.covers.length > 1 ? p : undefined;
  };

  const pick = (p: Product) => {
    setTried(false);
    setChosen((cur) => {
      if (cur.includes(p.id)) return cur.filter((id) => id !== p.id);
      // One product per coverage: anything already covering what this covers leaves.
      const kept = cur.filter((id) => !byId(id).covers.some((c) => p.covers.includes(c)));
      return [...kept, p.id];
    });
  };

  const missing = COVERAGES.filter((c) => c.required && !coverageOf(c.id));
  const total = PLAN + ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);

  return (
    <Stage caption="Products are chosen against coverage, not by count. Try picking Simparica Trio, then Continue with a coverage empty.">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Form column */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-xl bg-[var(--ec-card)] p-5 shadow-[0_0_0_1px_var(--ec-200)]">
            <div className="mb-1 flex items-baseline justify-between">
              <h3 className="text-[16px] leading-6 font-semibold">Products</h3>
              <span className="text-[12px] leading-4 text-[var(--ec-500)]">
                {chosen.length} of 3 products, sized for 12.3 lb
              </span>
            </div>
            <p className="mb-4 text-[14px] leading-5 text-[var(--ec-600)]">
              Heartworm and flea and tick are required. Intestinal parasite is optional.
            </p>

            <div className="flex flex-col gap-4">
              {COVERAGES.map((cov) => {
                const lock = lockedBy(cov.id);
                const current = coverageOf(cov.id);
                const err = tried && cov.required && !current;
                return (
                  <div key={cov.id}>
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-[12px] leading-4 font-semibold tracking-wide text-[var(--ec-600)] uppercase">
                        {cov.label}
                      </span>
                      <span className="text-[12px] leading-4 text-[var(--ec-500)]">
                        {cov.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <div
                      className="overflow-hidden rounded-lg transition-shadow duration-(--duration-fast)"
                      style={{
                        boxShadow: err ? "0 0 0 1px var(--ec-danger)" : "0 0 0 1px var(--ec-200)",
                      }}
                    >
                      {PRODUCTS.filter((p) => p.covers.includes(cov.id) && p.covers.length === 1 || (p.covers[0] === cov.id && p.covers.length > 1)).map((p, i, arr) => {
                        const selected = chosen.includes(p.id);
                        const locked = Boolean(lock && lock.id !== p.id && !selected);
                        const combo = p.covers.length > 1;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={locked}
                            aria-pressed={selected}
                            onClick={() => pick(p)}
                            className="press flex min-h-11 w-full items-center gap-3 bg-[var(--ec-card)] px-3 text-left transition-colors duration-(--duration-fast) disabled:opacity-50"
                            style={{
                              borderTop: i === 0 ? undefined : "1px solid var(--ec-200)",
                              background: selected ? "var(--ec-primary-50)" : undefined,
                            }}
                          >
                            <span
                              aria-hidden
                              className="grid size-4 shrink-0 place-items-center rounded-full border-2 transition-colors duration-(--duration-fast)"
                              style={{ borderColor: selected ? "var(--ec-primary)" : "var(--ec-500)" }}
                            >
                              <span
                                className="size-2 rounded-full transition-transform duration-(--duration-fast)"
                                style={{ background: "var(--ec-primary)", transform: selected ? "scale(1)" : "scale(0)" }}
                              />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-[14px] leading-5">{p.name}</span>
                              <span className="text-[12px] leading-4 text-[var(--ec-500)]">
                                {p.band}
                                {combo ? `, also covers ${p.covers.filter((c) => c !== cov.id).map((c) => COVERAGES.find((x) => x.id === c)!.label.toLowerCase()).join(" and ")}` : ""}
                              </span>
                            </span>
                            {locked ? (
                              <span className="text-[12px] leading-4 text-[var(--ec-500)]">Covered by {lock!.name}</span>
                            ) : null}
                            {arr.length === 0 ? null : null}
                          </button>
                        );
                      })}
                    </div>
                    <p
                      role={err ? "alert" : undefined}
                      className="mt-1.5 text-[12px] leading-4 text-[var(--ec-danger-600)] transition-opacity duration-(--duration-fast)"
                      style={{ opacity: err ? 1 : 0, height: err ? undefined : 0, marginTop: err ? undefined : 0 }}
                    >
                      Choose a {cov.label.toLowerCase()} product to continue.
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-[var(--ec-card)] p-5 shadow-[0_0_0_1px_var(--ec-200)]">
            <h3 className="mb-3 text-[16px] leading-6 font-semibold">Add-ons</h3>
            <div className="overflow-hidden rounded-lg" style={{ boxShadow: "0 0 0 1px var(--ec-200)" }}>
              {ADDONS.map((a, i) => {
                const on = addons.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setAddons((cur) => (on ? cur.filter((x) => x !== a.id) : [...cur, a.id]))}
                    className="press flex min-h-11 w-full items-center gap-3 bg-[var(--ec-card)] px-3 text-left"
                    style={{ borderTop: i === 0 ? undefined : "1px solid var(--ec-200)", background: on ? "var(--ec-primary-50)" : undefined }}
                  >
                    <span
                      aria-hidden
                      className="grid size-4 shrink-0 place-items-center rounded-[4px] border-2 transition-colors duration-(--duration-fast)"
                      style={{ borderColor: on ? "var(--ec-primary)" : "var(--ec-500)", background: on ? "var(--ec-primary)" : undefined }}
                    >
                      <svg viewBox="0 0 12 12" className="size-3" style={{ opacity: on ? 1 : 0 }} aria-hidden>
                        <path d="M2.5 6.5 5 9l4.5-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="flex-1 text-[14px] leading-5">{a.name}</span>
                    <span className="text-[14px] leading-5 text-[var(--ec-600)]">
                      {money(a.price)} {a.cadence}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" className="press min-h-11 rounded-lg px-4 text-[14px] font-medium text-[var(--ec-600)]">
              Back
            </button>
            <button
              type="button"
              onClick={() => setTried(true)}
              className="press min-h-11 rounded-lg px-5 text-[14px] font-medium text-white"
              style={{ background: "var(--ec-primary)" }}
            >
              Continue
            </button>
          </div>
        </div>

        {/* Cart rail */}
        <aside className="flex w-full flex-col gap-3 rounded-xl bg-[var(--ec-card)] p-5 shadow-[0_0_0_1px_var(--ec-200)] sm:w-[16rem] sm:self-start">
          <div>
            <p className="text-[16px] leading-6 font-semibold">Cricket</p>
            <p className="text-[12px] leading-4 text-[var(--ec-500)]">Canine, Shih Tzu, 12.3 lb today</p>
          </div>
          <div className="h-px bg-[var(--ec-200)]" />
          <div className="flex items-baseline justify-between text-[14px] leading-5">
            <span>Small Dog Plan v1</span>
            <span>{money(PLAN)}</span>
          </div>
          <ul className="flex flex-col gap-1 text-[12px] leading-4 text-[var(--ec-600)]">
            {chosen.map((id) => (
              <li key={id} className="flex justify-between">
                <span>{byId(id).name}</span>
                <span className="text-[var(--ec-500)]">included</span>
              </li>
            ))}
            {ADDONS.filter((a) => addons.includes(a.id)).map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{a.name}</span>
                <span>{money(a.price)}</span>
              </li>
            ))}
          </ul>
          <div className="h-px bg-[var(--ec-200)]" />
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] leading-5 font-medium">Per month</span>
            <span className="text-[18px] leading-7 font-semibold">
              <Settle value={total} />
            </span>
          </div>
          <p className="text-[12px] leading-4 text-[var(--ec-500)]">
            {missing.length === 0 ? "Ready for a doctor." : `${missing.length} required coverage${missing.length > 1 ? "s" : ""} still empty.`}
          </p>
        </aside>
      </div>
    </Stage>
  );
}
