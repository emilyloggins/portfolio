"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Enrollment, playing itself: the Plan / Products / Add-ons / Pay stepper fills in
 * step by step while the cart below it builds. Styled in the Nov 11 Easy
 * Care direction (Hers-inspired): Instrument Sans, regular-weight two-tone
 * title, a soft lavender surface with no dividers, a pill for the money
 * action. The stage is a fixed height so the page never shifts as rows land.
 */
const ecSans = localFont({
  src: "../../../app/fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
});

const C = {
  ink: "#16131F",
  muted: "#85809C",
  accent: "#9387D0",
  primary: "#211359",
  edge: "#EEEEF0",
  mid: "#F3F3F5",
  border: "#E4E4E7",
  track: "#E7E7EA",
};

type Item = {
  id: string;
  kind: "plan" | "product" | "addon";
  name: string;
  sub?: string;
  price?: number;
};

const ITEMS: Item[] = [
  {
    id: "plan",
    kind: "plan",
    name: "Small Dog Plan v1",
    sub: "9 services, billed monthly",
    price: 54,
  },
  {
    id: "heartgard",
    kind: "product",
    name: "Heartgard Plus",
    sub: "Heartworm, 6 to 25 lbs",
  },
  {
    id: "nexgard",
    kind: "product",
    name: "NexGard",
    sub: "28.3 mg, 10.1 to 24.0 lbs",
  },
  { id: "nails", kind: "addon", name: "Nail trim, 3", price: 12 },
];

const LABEL: Record<Item["kind"], string> = {
  plan: "Plan",
  product: "Products",
  addon: "Add-ons",
};

/**
 * The stepper narrates the cart: each step lights up, then its items land.
 * Phases: 0 idle, 1 Plan active, 2 plan lands, 3 Products active,
 * 4 Heartgard, 5 NexGard, 6 Add-ons active, 7 nail trim, 8 Pay active with
 * the pay pill, 9 processing, 10 paid, 11 the cart fades out before the loop
 * restarts. Loops for as long as it is on screen.
 */
const PHASE_MS = [
  1000, 700, 1200, 700, 1000, 1200, 700, 1200, 1400, 1400, 3600, 550,
];
/** The phase at which each item in ITEMS lands, in order. */
const ITEM_AT = [2, 4, 5, 7];
const PLAN_ON = 1;
const PRODUCTS_ON = 3;
const ADDONS_ON = 6;
const PAY_ON = 8;
const PROCESSING = 9;
const PAID = 10;
const CLEAR = 11;
const LAST = PHASE_MS.length - 1;
const EASE = [0.16, 1, 0.3, 1] as const;
const money = (n: number) => `$${n.toFixed(2)}`;

type StepState = "upcoming" | "active" | "done";

export function Cart() {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? LAST : 0);
  // Each pass remounts the cart contents, so nothing from the last one lingers.
  const [loop, setLoop] = useState(0);
  // Runs whenever it is on screen and the tab is visible; no hover pause.
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.15,
    });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const running = !reduce && inView && tabVisible;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      if (p >= LAST) setLoop((l) => l + 1);
      setP((v) => (v >= LAST ? 0 : v + 1));
    }, PHASE_MS[p]);
    return () => window.clearTimeout(t);
  }, [p, running]);

  const stepState = (on: number, next: number): StepState =>
    p < on ? "upcoming" : p < next ? "active" : "done";
  const steps: Array<{ label: string; state: StepState }> = [
    { label: "Plan", state: stepState(PLAN_ON, PRODUCTS_ON) },
    { label: "Products", state: stepState(PRODUCTS_ON, ADDONS_ON) },
    { label: "Add-ons", state: stepState(ADDONS_ON, PAY_ON) },
    { label: "Pay", state: stepState(PAY_ON, PAID) },
  ];
  const n = ITEM_AT.filter((at) => p >= at).length;
  const shown = ITEMS.slice(0, n);
  const total = shown.reduce((s, it) => s + (it.price ?? 0), 0);
  const payVisible = p >= PAY_ON;
  const processing = p === PROCESSING;
  const paid = p >= PAID;
  const clearing = p === CLEAR;

  const rows: Array<{ key: string; label?: string; item?: Item }> = [];
  shown.forEach((item, i) => {
    if (i === 0 || shown[i - 1].kind !== item.kind)
      rows.push({ key: `${item.kind}-label`, label: LABEL[item.kind] });
    rows.push({ key: item.id, item });
  });

  return (
    <figure className="my-2">
      <div
        ref={stageRef}
        className={`${ecSans.className} flex h-[42rem] flex-col items-center pt-2`}
        style={{ color: C.ink, fontFeatureSettings: '"tnum"' }}
        aria-hidden="true"
      >
        {/* Stepper */}
        <ol className="flex w-full max-w-[30rem] items-center">
          {steps.flatMap((s, i) => {
            const step = (
              <li key={s.label} className="flex shrink-0 items-center">
                <Step index={i + 1} label={s.label} state={s.state} />
              </li>
            );
            if (i === steps.length - 1) return [step];
            // Lines are their own items so all three share the space equally.
            const line = (
              <li
                key={`${s.label}-line`}
                aria-hidden
                className="relative mx-2.5 h-[2px] min-w-6 flex-1 overflow-hidden rounded-full"
                style={{ background: C.track }}
              >
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: C.accent }}
                  initial={false}
                  animate={{ width: s.state === "done" ? "100%" : "0%" }}
                  transition={{ duration: 0.7, ease: EASE }}
                />
              </li>
            );
            return [step, line];
          })}
        </ol>

        {/* Cart */}
        <div
          className="mt-9 w-full max-w-[30rem] rounded-[24px] px-7 pt-7 pb-6"
          style={{
            background: `linear-gradient(180deg, ${C.edge} 0%, ${C.mid} 40%, ${C.mid} 85%, ${C.edge} 100%)`,
            boxShadow: `inset 0 0 0 1px ${C.border}`,
          }}
        >
          <motion.div
            key={loop}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{
              opacity: clearing ? 0 : 1,
              filter: clearing ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div>
              <p className="text-[24px] leading-[30px] tracking-[-0.01em]">
                <span style={{ color: C.accent }}>Cricket&rsquo;s</span>{" "}
                enrollment
              </p>
              <p
                className="mt-1 text-[13px] leading-[18px]"
                style={{ color: C.muted }}
              >
                Shih tzu, 12.3 lbs, for Dillon Johnson
              </p>
            </div>

            <motion.ul layout className="mt-4 flex flex-col">
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
                      className="pt-4 pb-1 text-[13px] leading-[18px]"
                      style={{ color: C.muted }}
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
                      className="relative flex items-baseline justify-between gap-4 py-2"
                    >
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="pointer-events-none absolute -inset-x-3 inset-y-0 rounded-xl bg-white"
                      />
                      <span className="relative flex min-w-0 flex-col">
                        <span className="truncate text-[15px] leading-5">
                          {item.name}
                        </span>
                        {item.sub ? (
                          <span
                            className="truncate text-[13px] leading-[18px]"
                            style={{ color: C.muted }}
                          >
                            {item.sub}
                          </span>
                        ) : null}
                      </span>
                      <span className="relative shrink-0 text-[15px] leading-5">
                        {item.price != null ? (
                          money(item.price)
                        ) : (
                          <span style={{ color: C.muted }}>Included</span>
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
                    className="pt-4 text-[13px] leading-[18px]"
                    style={{ color: C.muted }}
                  >
                    Pick a plan to start.
                  </motion.li>
                ) : null}
              </AnimatePresence>
            </motion.ul>

            <motion.div
              layout
              transition={{ duration: 0.75, ease: EASE }}
              className="mt-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span
                  className="text-[14px] leading-5"
                  style={{ color: C.muted }}
                >
                  Monthly total
                </span>
                <span className="relative block h-9 overflow-hidden text-right">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={total}
                      initial={{ y: "0.8em", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "-0.8em", opacity: 0 }}
                      transition={{ duration: 0.68, ease: EASE }}
                      className="block text-[30px] leading-9 tracking-[-0.01em]"
                    >
                      {money(total)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>

              <AnimatePresence initial={false}>
                {payVisible ? (
                  <motion.div
                    key="pay"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white"
                      initial={false}
                      animate={{
                        backgroundColor: paid ? C.accent : C.primary,
                        scale: paid ? [0.97, 1] : 1,
                      }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={
                            paid ? "paid" : processing ? "processing" : "pay"
                          }
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {paid ? (
                            <>
                              <Check /> Payment successful
                            </>
                          ) : processing ? (
                            <Spinner />
                          ) : (
                            `Pay ${money(total)}`
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <p className="sr-only">
        An enrollment for Cricket playing out: the Plan, Products, Add-ons and
        Pay steps fill in one by one while the cart adds a Small Dog Plan at
        $54.00 a month, two included products, and a nail trim add-on at $12.00,
        for a monthly total of $66.00, then the payment goes through.
      </p>
    </figure>
  );
}

function Step({
  index,
  label,
  state,
}: {
  index: number;
  label: string;
  state: StepState;
}) {
  const bg =
    state === "upcoming" ? C.edge : state === "active" ? C.primary : C.accent;
  return (
    <span className="flex items-center gap-2.5">
      <motion.span
        className="relative flex size-7 items-center justify-center rounded-full text-[13px]"
        initial={false}
        animate={{
          backgroundColor: bg,
          color: state === "upcoming" ? C.muted : "#ffffff",
          boxShadow:
            state === "active"
              ? `0 0 0 5px ${C.accent}33`
              : `0 0 0 0px ${C.accent}00`,
        }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={state === "done" ? "check" : "num"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex"
          >
            {state === "done" ? <Check /> : index}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <motion.span
        className="text-[14px] leading-5 whitespace-nowrap"
        initial={false}
        animate={{ color: state === "upcoming" ? C.muted : C.ink }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {label}
      </motion.span>
    </span>
  );
}

function Spinner() {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Processing payment"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="2.5"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function Check() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
