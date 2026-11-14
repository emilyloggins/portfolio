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

        <Entry place="Sarah Cannon Research Institute" role="Data Analyst II" when="2023 to 2024" meta="Cancer research, HCA Healthcare, Nashville">
          <li>
            Migrated databases across different systems, maintaining system roles and security
          </li>
          <li>
            Developed reports requested by the business using SQL Server Management Studio
          </li>
          <li>
            Monitored server space, pipeline failures, and databases
          </li>
          <li>
            Supervised the pipeline deployment process
          </li>
          <li>
            Updated pipelines in Azure Data Factory
          </li>
          <li>
            Designed an Operational Support Dashboard in Power BI
          </li>
        </Entry>

        <Entry place="Kroll" role="Software Engineer II" when="2021 to 2022" meta="Financial and risk advisory, Nashville">
          <li>
            Led a UI team on a React greenfield project, acting as the main point of contact for the business
          </li>
          <li>
            Rearchitected a large Angular legacy code base by modularizing components, creating shared components, and minimizing unused or repetitive code
          </li>
          <li>
            Transitioned an app&apos;s UI components from one library to another while maintaining complex logic
          </li>
          <li>
            Formulated best practices for the growing team
          </li>
          <li>
            Mentored new developers
          </li>
        </Entry>

        <Entry place="Sarah Cannon Research Institute" role="Application Engineer" when="2019 to 2021" meta="Cancer research, HCA Healthcare, Nashville">
          <li>
            Developed an Angular application used to run clinical trials at more than 300 locations worldwide
          </li>
          <li>
            Programmed data-intensive screens for all screen sizes
          </li>
          <li>
            Contributed to the creation of multiple node packages and a widely used component library
          </li>
          <li>
            Collaborated closely with the UX designer and developed off of high fidelity prototypes
          </li>
          <li>
            Integrated compliant coding practices modeled after ADA regulations
          </li>
          <li>
            Developed other notable projects, including a stroke registry for the American Heart Association, the world&apos;s first patient COVID-19 registry, and a portal for clinical trial participants
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
        <Entry place="Belmont University" role="Bachelor of Music" when="" />
        <Entry place="Nashville Software School" role="Full Stack Web Development Bootcamp" when="2019" />
      </Section>
    </main>
  );
}
