import localFont from "next/font/local";

/**
 * Easy Care's design system at a glance: the typeface, the main colors (with
 * how the primary ties to MWI's brand), and a few HeroUI components in the
 * Easy Care style. Same on-page container as the sign dialog (white, hairline
 * border, no shadow), 480px wide like the other figures.
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
  border: "#E4E4E7",
  surface: "#F3F3F5",
  tint: "#F4F2FB",
};

const COLORS = [
  { name: "MWI purple", hex: "#211359", use: "Primary actions" },
  { name: "Lavender", hex: "#9387D0", use: "Accents" },
  { name: "Ink", hex: "#16131F", use: "Text" },
  { name: "Gray", hex: "#F3F3F5", use: "Surfaces", edge: true },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12.5px] leading-4" style={{ color: C.muted }}>
      {children}
    </p>
  );
}

export function System() {
  return (
    <figure className="my-2">
      <div
        className={`${ecSans.className} mx-auto flex w-full max-w-[30rem] flex-col gap-8 rounded-[24px] bg-white p-8`}
        style={{ color: C.ink, boxShadow: `inset 0 0 0 1px ${C.border}` }}
      >
        {/* Typeface */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end gap-5">
            <span className="text-[64px] leading-[56px] tracking-[-0.02em]">Aa</span>
            <div className="pb-0.5">
              <p className="text-[17px] leading-6 font-medium">Instrument Sans</p>
              <p className="text-[13px] leading-[18px]" style={{ color: C.muted }}>
                Regular and Medium
              </p>
            </div>
          </div>
        </section>

        {/* Color */}
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="flex flex-col gap-2">
                <span
                  className="block aspect-square w-full rounded-[14px]"
                  style={{ background: c.hex, boxShadow: c.edge ? `inset 0 0 0 1px ${C.border}` : undefined }}
                />
                <div>
                  <p className="text-[13px] leading-[18px] font-medium">{c.name}</p>
                  <p className="text-[12px] leading-4" style={{ color: C.muted }}>
                    {c.use}
                  </p>
                  <p className="text-[12px] leading-4 tabular-nums" style={{ color: C.muted }}>
                    {c.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-[19px] text-pretty" style={{ color: C.muted }}>
            The primary color is MWI&rsquo;s brand purple. It&rsquo;s mapped into HeroUI&rsquo;s primary tokens, so
            every button, focus ring and selected state carries MWI&rsquo;s brand.
          </p>
        </section>

        {/* Components */}
        <section className="flex flex-col gap-3">
          <Label>Components, built on HeroUI</Label>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-full px-5 py-2 text-[14px] leading-5 text-white"
              style={{ background: C.primary }}
            >
              Continue
            </span>
            <span
              className="rounded-full bg-white px-5 py-2 text-[14px] leading-5"
              style={{ color: C.primary, boxShadow: `inset 0 0 0 1px ${C.border}` }}
            >
              Cancel
            </span>
            <span
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[14px] leading-5"
              style={{ background: C.tint, boxShadow: `inset 0 0 0 1.5px ${C.accent}` }}
            >
              <span
                className="grid size-4 place-items-center rounded-full bg-white"
                style={{ boxShadow: `inset 0 0 0 1.5px ${C.primary}` }}
              >
                <span className="size-2 rounded-full" style={{ background: C.primary }} />
              </span>
              NexGard
            </span>
            <span className="relative h-5 w-9 rounded-full" style={{ background: C.primary }}>
              <span className="absolute top-0.5 right-0.5 size-4 rounded-full bg-white" />
            </span>
          </div>
        </section>
      </div>
      <p className="sr-only">
        Easy Care&rsquo;s design system: Instrument Sans; MWI purple #211359 for primary actions, lavender #9387D0 for
        accents, ink #16131F for text and gray #F3F3F5 for surfaces; and HeroUI components such as buttons, an option
        row and a toggle.
      </p>
    </figure>
  );
}
