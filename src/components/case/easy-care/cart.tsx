"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EC_VARS } from "./stage";

/**
 * The cart from the What screen, filling itself, beside a note on what it is
 * doing. The stage is a fixed height so the page never shifts as rows land:
 * the card grows inside reserved space, top-anchored.
 */
type Item = {
  id: string;
  kind: "plan" | "product" | "addon";
  name: string;
  sub?: string;
  price?: number;
};

const ITEMS: Item[] = [
  { id: "plan", kind: "plan", name: "Small Dog Plan v1", sub: "9 services, billed monthly", price: 54 },
  { id: "heartgard", kind: "product", name: "Heartgard Plus", sub: "Heartworm, 6 to 25 lbs" },
  { id: "nexgard", kind: "product", name: "NexGard", sub: "Fleas, ticks, 10 to 24 lbs" },
  { id: "nails", kind: "addon", name: "Nail trim, 3", price: 12 },
  { id: "fecal", kind: "addon", name: "Fecal", price: 2 },
];

const LABEL: Record<Item["kind"], string> = {
  plan: "Plan",
  product: "Products",
  addon: "Add-ons",
};

/** Unhurried: each item lands, then the eye gets a beat before the next. */
const STEP_MS = [1000, 1250, 1000, 1300, 1000];
const HOLD_MS = 3600;
const EASE = [0.16, 1, 0.3, 1] as const;

const money = (n: number) => `$${n.toFixed(2)}`;

export function Cart() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? ITEMS.length : 0);
  const [held, setHeld] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (reduce || held) return;
    const wait = n >= ITEMS.length ? HOLD_MS : STEP_MS[n];
    timer.current = window.setTimeout(
      () => setN((v) => (v >= ITEMS.length ? 0 : v + 1)),
      wait,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [n, held, reduce]);

  const shown = ITEMS.slice(0, n);
  const total = shown.reduce((sum, it) => sum + (it.price ?? 0), 0);

  // A heading appears with the first item of its kind.
  const rows: Array<{ key: string; label?: string; item?: Item }> = [];
  shown.forEach((item, i) => {
    if (i === 0 || shown[i - 1].kind !== item.kind) {
      rows.push({ key: `${item.kind}-label`, label: LABEL[item.kind] });
    }
    rows.push({ key: item.id, item });
  });

  return (
    <figure className="@container my-2">
      <div className="grid overflow-hidden rounded-md border border-line bg-ground @[34rem]:grid-cols-2">
        {/* The product, running */}
        <div
          className="ec flex h-[31rem] items-start justify-center border-b border-line bg-[var(--ec-bg)] p-4 text-[var(--ec-fg)] @[34rem]:border-r @[34rem]:border-b-0"
          style={EC_VARS}
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
        >
          <div
            className="w-full max-w-[19rem] rounded-xl bg-[var(--ec-card)] p-4 shadow-[0_0_0_1px_var(--ec-200)]"
            aria-hidden="true"
          >
            <p className="text-[14px] leading-5 font-semibold">Cricket&rsquo;s enrollment</p>

            <motion.ul layout className="mt-2.5 flex flex-col">
              <AnimatePresence initial={false} mode="popLayout">
                {rows.map(({ key, label, item }) =>
                  label ? (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="pt-2.5 pb-1 text-[11px] leading-4 tracking-wide text-[var(--ec-500)] uppercase"
                    >
                      {label}
                    </motion.li>
                  ) : item ? (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                      transition={{ duration: 0.75, ease: EASE }}
                      className="relative flex items-baseline justify-between gap-4 border-t border-[var(--ec-200)] py-2 first:border-t-0"
                    >
                      {/* the just-added flush, fading out behind the row */}
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0.55 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="pointer-events-none absolute -inset-x-2 -inset-y-0.5 rounded-md bg-[var(--ec-primary-50)]"
                      />
                      <span className="relative flex min-w-0 flex-col">
                        <span className="truncate text-[14px] leading-5">{item.name}</span>
                        {item.sub ? (
                          <span className="truncate text-[12px] leading-4 text-[var(--ec-500)]">
                            {item.sub}
                          </span>
                        ) : null}
                      </span>
                      <span className="relative shrink-0 text-[14px] leading-5">
                        {item.price != null ? (
                          money(item.price)
                        ) : (
                          <span className="text-[var(--ec-500)]">Included</span>
                        )}
                      </span>
                    </motion.li>
                  ) : null,
                )}

                {n === 0 ? (
                  <motion.li
                    key="empty"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="py-2 text-[13px] leading-5 text-[var(--ec-500)]"
                  >
                    Pick a plan to start.
                  </motion.li>
                ) : null}
              </AnimatePresence>
            </motion.ul>

            <motion.div
              layout
              transition={{ duration: 0.75, ease: EASE }}
              className="mt-2.5 flex items-baseline justify-between gap-4 border-t-2 border-[var(--ec-fg)] pt-2.5"
            >
              <span className="text-[14px] leading-5 font-medium">Monthly total</span>
              <span className="relative block h-7 overflow-hidden text-right">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={total}
                    initial={{ y: "0.8em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-0.8em", opacity: 0 }}
                    transition={{ duration: 0.68, ease: EASE }}
                    className="block text-[20px] leading-7 font-medium"
                  >
                    {money(total)}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.div>
          </div>
        </div>

        {/* What it is doing */}
        <div className="flex flex-col justify-center gap-3 p-6 @[34rem]:h-[31rem]">
          <p className="text-body text-ink-3">Lorem ipsum</p>
          <h3 className="text-body font-medium text-ink">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h3>
          <p className="text-body text-ink-2">
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p className="hidden text-body text-ink-3 [@media(hover:hover)]:block">Hover to pause.</p>
        </div>
      </div>

      <p className="sr-only">
        A cart filling with a plan at $54.00 a month, two included products, and two add-ons at
        $12.00 and $2.00, for a monthly total of $68.00.
      </p>
    </figure>
  );
}
