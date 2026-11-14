import localFont from "next/font/local";

/**
 * Easy Care's side navigation, shown still: the logo, the clinic, and the
 * nine sections a clinic user moves between. Same on-page container as the
 * sign dialog (white, hairline border, no shadow), sized to its content with
 * the same padding on every side.
 */
const ecSans = localFont({
  src: "../../../app/fonts/instrument-sans-latin-wght-normal.woff2",
  weight: "400 700",
  display: "swap",
});

const C = {
  ink: "#16131F",
  muted: "#85809C",
  border: "#E4E4E7",
};

const ITEMS = [
  "Enroll a pet",
  "Plan activity",
  "Service history",
  "Prescriptions",
  "Commissions",
  "Orders",
  "Plan settings",
  "Reports",
  "Doctors",
];

export function Nav() {
  return (
    <figure className="my-2">
      <div
        className={`${ecSans.className} mx-auto w-fit rounded-[24px] bg-white p-8`}
        style={{ color: C.ink, boxShadow: `inset 0 0 0 1px ${C.border}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/work/easy-care/easy-care-logo.png" alt="Easy Care" width={290} height={50} className="block h-[22px] w-auto" />
        <p className="mt-2 text-[12.5px] leading-4" style={{ color: C.muted }}>
          K9 Resort Clinic Spa
        </p>
        <ul className="mt-7 flex flex-col gap-4 text-[14.5px] leading-[18px]" style={{ color: C.muted }}>
          {ITEMS.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
