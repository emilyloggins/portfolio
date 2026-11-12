"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Enrollment, playing itself. A Plan / Products / Add-ons / Pay stepper
 * narrates a cart: each step lights up, its section heading appears, its
 * item lands, and the total rolls to its new value like an odometer. Pay
 * presses, processes and succeeds. Then the whole thing rewinds in order:
 * the pay button folds away, rows lift out from the bottom up as the card
 * shrinks, the total rolls back to zero and the steps uncheck in reverse.
 *
 * Styled in the Nov 11 Easy Care direction (Hers-inspired): Instrument Sans,
 * two-tone title, a light grey surface with a hairline border, no dividers,
 * a pill for the money action. Springs for anything that moves, tweens only
 * for colour and opacity. The stage is a fixed height so the page never
 * shifts: the card is a fixed size, like a real checkout panel, with the
 * total and the pay button pinned to its bottom.
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
  disabledBg: "#E6E6EA",
  disabledInk: "#A1A1AA",
  track: "#E7E7EA",
};

type Kind = "plan" | "product" | "addon";
type Item = {
  id: string;
  kind: Kind;
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
const KINDS: Kind[] = ["plan", "product", "addon"];
const LABEL: Record<Kind, string> = {
  plan: "Plan",
  product: "Products",
  addon: "Add-ons",
};

/**
 * Phases: 0 empty (on later loops, the rewind plays here), 1 Plan active,
 * 2 plan lands, 3 Products active, 4 Heartgard, 5 NexGard, 6 Add-ons active,
 * 7 nail trim, 8 Pay active with the pay pill, 9 pressed and processing,
 * 10 paid. From 10 it rewinds to 0.
 */
const PHASE_MS = [
  2000, 450, 1300, 450, 1000, 1300, 450, 1300, 1300, 1500, 3400,
];
const ITEM_AT = [2, 4, 5, 7]; // phase at which each item in ITEMS lands
const STEP_ON = { plan: 1, product: 3, addon: 6, pay: 8 } as const;
const PROCESSING = 9;
const PAID = 10;
const LAST = PHASE_MS.length - 1;
/** Rewind timing: the pay pill folds first, then rows leave bottom-up. */
const REWIND_ROW_START = 0.18;
const REWIND_ROW_STAGGER = 0.07;

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 0.9,
} as const;
const SOFT = { type: "spring", stiffness: 170, damping: 26 } as const;

type StepState = "upcoming" | "active" | "done";

export function Cart() {
  const reduce = useReducedMotion();
  const [p, setP] = useState(reduce ? PAID : 0);
  const [loop, setLoop] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  // Runs whenever it is on screen and the tab is visible.
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
    const t = window.setTimeout(
      () => {
        if (p >= LAST) setLoop((l) => l + 1);
        setP((v) => (v >= LAST ? 0 : v + 1));
      },
      p === 0 && loop === 0 ? 900 : PHASE_MS[p],
    ); // no rewind pause on first load
    return () => window.clearTimeout(t);
  }, [p, running, loop]);

  const stateOf = (on: number, next: number): StepState =>
    p < on ? "upcoming" : p < next ? "active" : "done";
  const steps = [
    {
      label: "Plan",
      state: stateOf(STEP_ON.plan, STEP_ON.product),
    },
    {
      label: "Products",
      state: stateOf(STEP_ON.product, STEP_ON.addon),
    },
    {
      label: "Add-ons",
      state: stateOf(STEP_ON.addon, STEP_ON.pay),
    },
    {
      label: "Pay",
      state: stateOf(STEP_ON.pay, PAID),
    },
  ];
  const kindState: Record<Kind, StepState> = {
    plan: steps[0].state,
    product: steps[1].state,
    addon: steps[2].state,
  };

  const shown = ITEMS.filter((_, i) => p >= ITEM_AT[i]);
  const total = shown.reduce((s, it) => s + (it.price ?? 0), 0);
  const payVisible = p >= STEP_ON.pay;
  const processing = p === PROCESSING;
  const paid = p >= PAID;
  const rewinding = p === 0 && loop > 0;

  // Each section's heading appears when its step starts; its items follow.
  const rows: Array<{
    key: string;
    type: "label" | "item";
    text?: string;
    item?: Item;
  }> = [];
  for (const k of KINDS) {
    if (kindState[k] === "upcoming") continue;
    rows.push({ key: `${k}-label`, type: "label", text: LABEL[k] });
    shown
      .filter((it) => it.kind === k)
      .forEach((it) => rows.push({ key: it.id, type: "item", item: it }));
  }
  // Exit delay for each row, so a rewind lifts them out from the bottom up.
  const exitDelay = (i: number) =>
    REWIND_ROW_START + (rows.length - 1 - i) * REWIND_ROW_STAGGER;
  // On rewind the full cart (every heading and item) leaves; the empty state waits for it.
  const rewindSpan =
    REWIND_ROW_START + (KINDS.length + ITEMS.length) * REWIND_ROW_STAGGER;

  return (
    <figure className="my-2">
      <div
        ref={stageRef}
        className={`${ecSans.className} flex flex-col items-center pt-2`}
        style={{ color: C.ink, fontFeatureSettings: '"tnum"' }}
        aria-hidden="true"
      >
        {/* Stepper */}
        <ol className="flex w-full max-w-[30rem] items-center">
          {steps.flatMap((s, i) => {
            const step = (
              <li key={s.label} className="flex shrink-0 items-center">
                <Step
                  index={i + 1}
                  label={s.label}
                  state={s.state}
                  delay={rewinding ? 0.55 + (steps.length - 1 - i) * 0.11 : 0}
                />
              </li>
            );
            if (i === steps.length - 1) return [step];
            const line = (
              <li
                key={`${s.label}-line`}
                className="relative mx-2.5 h-[2px] min-w-6 flex-1 overflow-hidden rounded-full"
                style={{ background: C.track }}
              >
                <motion.span
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full"
                  style={{ background: C.accent }}
                  initial={false}
                  animate={{ scaleX: s.state === "done" ? 1 : 0 }}
                  transition={{
                    duration: rewinding ? 0.45 : 0.8,
                    ease: EASE,
                    delay:
                      s.state === "done"
                        ? 0.15
                        : rewinding
                          ? 0.55 + (steps.length - 2 - i) * 0.11
                          : 0,
                  }}
                />
              </li>
            );
            return [step, line];
          })}
        </ol>

        {/* Cart: a fixed size, like a real checkout panel. Items fill from the
            top; the total and the pay button stay pinned to the bottom. */}
        <div
          className="mt-9 flex h-[36rem] w-full max-w-[30rem] flex-col overflow-hidden rounded-[24px]"
          style={{
            background: `linear-gradient(180deg, ${C.edge} 0%, ${C.mid} 40%, ${C.mid} 85%, ${C.edge} 100%)`,
            boxShadow: `inset 0 0 0 1px ${C.border}`,
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col px-7 pt-7 pb-6">
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

            <ul className="mt-4 flex min-h-0 flex-1 flex-col">
              <AnimatePresence initial={false}>
                {p === 0 ? (
                  <Fold
                    key="empty"
                    enterDelay={rewinding ? rewindSpan + 0.3 : 0}
                    exitDelay={0}
                  >
                    <p
                      className="pt-4 text-[13px] leading-[18px]"
                      style={{ color: C.muted }}
                    >
                      Pick a plan to start.
                    </p>
                  </Fold>
                ) : null}
                {rows.map((r, i) =>
                  r.type === "label" ? (
                    <Fold key={r.key} exitDelay={exitDelay(i)}>
                      <p
                        className="pt-4 pb-1 text-[13px] leading-[18px]"
                        style={{ color: C.muted }}
                      >
                        {r.text}
                      </p>
                    </Fold>
                  ) : r.item ? (
                    <Fold key={r.key} exitDelay={exitDelay(i)} blur>
                      <ItemRow item={r.item} />
                    </Fold>
                  ) : null,
                )}
              </AnimatePresence>
            </ul>

            <motion.div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <span
                  className="text-[14px] leading-5"
                  style={{ color: C.muted }}
                >
                  Monthly total
                </span>
                <Money
                  value={total}
                  delay={rewinding ? REWIND_ROW_START + 0.1 : 0}
                />
              </div>

              <div className="pt-5">
                <motion.div
                  className="relative flex h-12 items-center justify-center rounded-full text-[15px] font-medium"
                  initial={false}
                  animate={{
                    backgroundColor: paid
                      ? C.accent
                      : payVisible
                        ? C.primary
                        : C.disabledBg,
                    color: payVisible ? "#ffffff" : C.disabledInk,
                    scale: processing ? [1, 0.97, 1] : 1,
                    boxShadow: paid
                      ? [`0 0 0 0px ${C.accent}66`, `0 0 0 10px ${C.accent}00`]
                      : `0 0 0 0px ${C.accent}00`,
                  }}
                  transition={{
                    backgroundColor: { duration: 0.5, ease: EASE },
                    color: { duration: 0.5, ease: EASE },
                    scale: { duration: 0.32, ease: EASE },
                    boxShadow: { duration: 0.9, ease: "easeOut" },
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={paid ? "paid" : processing ? "processing" : "pay"}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -8, filter: "blur(3px)" }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {paid ? (
                        <>
                          <DrawnCheck size={16} /> Payment successful
                        </>
                      ) : processing ? (
                        <Spinner />
                      ) : (
                        `Pay $${total.toFixed(2)}`
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </div>
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

/**
 * A row that unfolds its height as it arrives and folds it closed as it
 * leaves, so the card grows and shrinks one row at a time (on rewind the
 * rows leave bottom-up via their exit delays).
 */
function Fold({
  children,
  exitDelay,
  enterDelay = 0,
  blur = false,
}: {
  children: React.ReactNode;
  exitDelay: number;
  enterDelay?: number;
  blur?: boolean;
}) {
  return (
    <motion.li
      className="overflow-hidden"
      initial={{
        height: 0,
        opacity: 0,
        filter: blur ? "blur(4px)" : "blur(0px)",
      }}
      animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
      exit={{
        height: 0,
        opacity: 0,
        filter: blur ? "blur(4px)" : "blur(0px)",
        transition: {
          height: { duration: 0.38, ease: EASE, delay: exitDelay + 0.05 },
          opacity: { duration: 0.24, ease: EASE, delay: exitDelay },
          filter: { duration: 0.24, ease: EASE, delay: exitDelay },
        },
      }}
      transition={{
        height: { ...SPRING, delay: enterDelay },
        opacity: { duration: 0.45, ease: EASE, delay: enterDelay + 0.05 },
        filter: { duration: 0.45, ease: EASE, delay: enterDelay + 0.05 },
      }}
    >
      {children}
    </motion.li>
  );
}

/** A cart row's content: the name settles first, the price follows a beat later. */
function ItemRow({ item }: { item: Item }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-[15px] leading-5">{item.name}</span>
        {item.sub ? (
          <span
            className="truncate text-[13px] leading-[18px]"
            style={{ color: C.muted }}
          >
            {item.sub}
          </span>
        ) : null}
      </span>
      <motion.span
        className="shrink-0 text-[15px] leading-5"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...SOFT, delay: 0.16 }}
      >
        {item.price != null ? (
          `$${item.price.toFixed(2)}`
        ) : (
          <span style={{ color: C.muted }}>Included</span>
        )}
      </motion.span>
    </div>
  );
}

/** The monthly total as an odometer: each digit rolls to its value on a spring. */
function Money({ value, delay = 0 }: { value: number; delay?: number }) {
  const cents = Math.round(value * 100);
  const whole = Math.floor(cents / 100);
  const tens = Math.floor(whole / 10) % 10;
  const ones = whole % 10;
  const c1 = Math.floor((cents % 100) / 10);
  const c2 = cents % 10;
  return (
    // Every character is a 36px-tall block on one row, so the rolling digits
    // and the static "$" and "." share a line (inline-block columns with
    // overflow hidden would otherwise sit on their bottom edge, not the baseline).
    <span className="flex h-9 items-start text-[30px] leading-9 tracking-[-0.01em]">
      <span className="block h-9 leading-9">$</span>
      <motion.span
        className="flex h-9 overflow-hidden"
        initial={false}
        animate={{
          width: whole >= 10 ? "1ch" : "0ch",
          opacity: whole >= 10 ? 1 : 0,
        }}
        transition={{ ...SOFT, delay: whole >= 10 ? delay : delay + 0.6 }} // collapse the tens column only after the digits have rolled down
      >
        <Digit d={tens} delay={delay} />
      </motion.span>
      <Digit d={ones} delay={delay} />
      <span className="block h-9 leading-9">.</span>
      <Digit d={c1} delay={delay} />
      <Digit d={c2} delay={delay} />
    </span>
  );
}

function Digit({ d, delay = 0 }: { d: number; delay?: number }) {
  return (
    <span className="relative block h-9 w-[1ch] shrink-0 overflow-hidden">
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: -d * 36 }}
        transition={{
          type: "spring",
          stiffness: 110,
          damping: 17,
          mass: 0.9,
          delay,
        }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-9 text-center leading-9">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Step({
  index,
  label,
  state,
  delay = 0,
}: {
  index: number;
  label: string;
  state: StepState;
  /** Used on rewind so the steps uncheck in reverse, one after another. */
  delay?: number;
}) {
  // The step switches colour, check and number together, after its delay.
  const [shown, setShown] = useState(state);
  useEffect(() => {
    if (delay <= 0) {
      setShown(state);
      return;
    }
    const t = window.setTimeout(() => setShown(state), delay * 1000);
    return () => window.clearTimeout(t);
  }, [state, delay]);
  const bg =
    shown === "upcoming" ? C.edge : shown === "active" ? C.primary : C.accent;
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex size-7 items-center justify-center">
        <motion.span
          className="flex size-7 items-center justify-center rounded-full text-[13px]"
          initial={false}
          animate={{
            backgroundColor: bg,
            color: shown === "upcoming" ? C.muted : "#ffffff",
            scale: shown === "active" ? 1.06 : 1,
          }}
          transition={{
            backgroundColor: { duration: 0.45, ease: EASE },
            color: { duration: 0.45 },
            scale: SOFT,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {shown === "done" ? (
              <motion.span
                key="check"
                className="flex"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <DrawnCheck size={13} />
              </motion.span>
            ) : (
              <motion.span
                key="num"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {index}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.span>
      </span>
      <motion.span
        className="whitespace-nowrap text-[14px] leading-5"
        initial={false}
        animate={{ color: shown === "upcoming" ? C.muted : C.ink }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {label}
      </motion.span>
    </span>
  );
}

/** A check that draws itself on. */
function DrawnCheck({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M20 6 9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease: EASE, delay: 0.08 }}
      />
    </svg>
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
