/**
 * Basin's design system at a glance, in the same shape as Easy Care's: the
 * typeface and the main colours, with the one rule that holds them
 * together. Same container (480px, hairline, no shadow); the swatches are
 * the app's real values, the glass one drawn as glass.
 */
const C = {
  ink: "#1e2a33",
  muted: "#5e6d79",
  border: "#e4e4e7",
};

const COLORS = [
  { name: "Lime", hex: "#d6eb6e", use: "The thing to act on" },
  { name: "Glacier", hex: "#d5e0ea", use: "The ground, poured" },
  { name: "Glass", hex: "#fbfcfd", use: "Everything raised", glass: true },
  { name: "Ink", hex: "#1e2a33", use: "Text" },
];

export function BasinSystem() {
  return (
    <figure className="my-2">
      <div
        className="mx-auto flex w-full max-w-[30rem] flex-col gap-8 rounded-[24px] bg-white p-8"
        style={{ color: C.ink, boxShadow: `inset 0 0 0 1px ${C.border}` }}
      >
        {/* Typeface */}
        <section className="flex flex-col gap-3">
          <div className="flex items-end gap-5">
            <span className="text-[64px] leading-[56px] tracking-[-0.02em]">Aa</span>
            <div className="pb-0.5">
              <p className="text-[17px] leading-6 font-medium">Inter</p>
              <p className="text-[13px] leading-[18px]" style={{ color: C.muted }}>
                Regular and Medium, four sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Colour */}
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="flex flex-col gap-2">
                <span
                  className="block aspect-square w-full rounded-[14px]"
                  style={
                    c.glass
                      ? {
                          background:
                            "linear-gradient(180deg, rgb(255 255 255 / 0.9) 0%, rgb(255 255 255 / 0.55) 42%), linear-gradient(160deg, #e6edf3 0%, #d5e0ea 100%)",
                          boxShadow: `inset 0 0 0 1px ${C.border}, inset 0 1px 0 rgb(255 255 255 / 0.9)`,
                        }
                      : { background: c.hex, boxShadow: c.hex === "#d5e0ea" ? `inset 0 0 0 1px ${C.border}` : undefined }
                  }
                />
                <div>
                  <p className="text-[13px] leading-[18px] font-medium">{c.name}</p>
                  <p className="text-[12px] leading-4" style={{ color: C.muted }}>
                    {c.use}
                  </p>
                  <p className="text-[12px] leading-4 tabular-nums" style={{ color: C.muted }}>
                    {c.glass ? "white, 72%" : c.hex}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[13px] leading-[19px] text-pretty" style={{ color: C.muted }}>
            One saturated colour, kept for the shutter, the wipe and a decision. Everything else is ink on frosted
            glass over a grainy glacier gradient.
          </p>
        </section>
      </div>
      <p className="sr-only">
        Basin&rsquo;s design system: Inter; lime #d6eb6e for the one action, glacier #d5e0ea for the ground, frosted
        white glass for raised surfaces, ink #1e2a33 for text.
      </p>
    </figure>
  );
}
