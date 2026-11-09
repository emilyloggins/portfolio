import Link from "next/link";
import { Name } from "@/components/name";
import { Todo } from "@/components/row";

export const metadata = { title: "Emily Loggins, resume" };

/**
 * The resume, in the site's own voice: the same column, the same type,
 * the same quiet. Nothing on it that isn't on the site, said shorter.
 * Prints to one Letter page (File, Print, Save as PDF); the print rules
 * live in globals.css under `.resume`. Placeholders are Emily's to fill.
 */
const SKILLS = [
  "Product design, end to end: research, flows, UI, prototypes",
  "Design systems: tokens, theming, component kits (HeroUI, shadcn)",
  "React, TypeScript, Next.js, Tailwind; iOS via Capacitor",
  "Figma, Motion, accessible interfaces (WCAG AA as the floor)",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-body font-medium text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Entry({
  place,
  role,
  when,
  meta,
  children,
}: {
  place: string;
  role: string;
  when: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-body text-ink">
          {place}
          <span className="text-ink-2">, {role}</span>
        </span>
        <span className="shrink-0 text-meta text-ink-3">{when}</span>
      </div>
      {meta ? <span className="text-meta text-ink-3">{meta}</span> : null}
      {children ? <ul className="flex list-disc flex-col gap-1 pl-5 text-body text-ink-2">{children}</ul> : null}
    </div>
  );
}

export default function Resume() {
  return (
    <main className="resume arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-10 px-6 py-24 print:max-w-none print:gap-7 print:px-0 print:py-0">
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-4">
          <Name as="h1" href="/" />
          <span className="text-meta text-ink-3">Brooklyn, NY</span>
        </div>
        <p className="text-body text-ink-2">Design Engineer. Research, design, React, ship: one person, the whole loop.</p>
        <p className="text-meta text-ink-3">
          em.loggins7@gmail.com
          <span className="text-ink-3">, </span>
          <a href="https://www.linkedin.com/in/emilyloggins" className="no-underline hover:text-ink">linkedin.com/in/emilyloggins</a>
          <span className="text-ink-3">, </span>
          <Link href="/" className="no-underline hover:text-ink">emilyloggins.com</Link>
        </p>
      </header>

      <Section title="Experience">
        <Entry place="IDEXX" role="UX Designer and Developer" when="2025 to now" meta="Veterinary software">
          <li>
            Designed and built Easy Care, a platform for vet clinics to enroll a pet in a year of
            preventive care: the enrollment flow, the doctor&apos;s prescription queue and the
            client profile, from research to shipped React.
          </li>
          <li>
            Themed HeroUI to the MWI brand by repointing fourteen tokens, extending the kit only
            where it had nothing; one ramp, four new components, five flows.
          </li>
          <li>
            <Todo>TODO(emily): the tvOS app, in plain words. What it did, for whom, what shipped.</Todo>
          </li>
        </Entry>

        <Entry place="Kroll" role="Software Engineer II" when="2021 to 2022" meta="Financial and risk advisory, Nashville">
          <li>
            <Todo>TODO(emily): one or two lines. What you built, the stack, who used it.</Todo>
          </li>
        </Entry>

        <Entry place="Sarah Cannon Research Institute" role="Application Engineer" when="2019 to 2021" meta="Cancer research, HCA Healthcare, Nashville">
          <li>
            Embedded on a full-stack design and development team, building enterprise applications
            for the cancer institute of HCA Healthcare.
          </li>
          <li>
            <Todo>TODO(emily): one concrete thing. A tool, a number, a before and after.</Todo>
          </li>
        </Entry>
      </Section>

      <Section title="Selected work">
        <Entry place="Basin" role="skincare companion app" when="2026" meta="Solo: product, design, engineering. Live at basin-six.vercel.app">
          <li>
            One photo a day, lined up on the first; trials derived from what each photo carried;
            a four-week check-in; Worked or Didn&apos;t work. Local-first, no account, no server.
          </li>
          <li>
            Next.js static export shipped to the web and inside an iOS binary via Capacitor;
            a hand-built glass design system with one accent, three radii and one motion curve.
          </li>
        </Entry>
        <Entry place="Easy Care" role="B2B web application" when="2025" meta="IDEXX, in partnership with MWI">
          <li>
            Products chosen against coverage rather than by count; money always shown with its
            cadence; a role never shown an action it can&apos;t take. <Todo>TODO(emily): one impact number.</Todo>
          </li>
        </Entry>
      </Section>

      <Section title="Skills">
        <ul className="flex flex-col gap-1 text-body text-ink-2">
          {SKILLS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Section>

      <Section title="Education">
        <Entry place={"TODO(emily): school"} role="TODO(emily): degree, music" when="TODO(emily): years" />
      </Section>
    </main>
  );
}
