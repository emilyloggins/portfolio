import Link from "next/link";
import { EmailRow } from "@/components/email-row";
import { List } from "@/components/list";
import { Name } from "@/components/name";
import { NowLabel } from "@/components/now-label";
import { HistoryRow, Row, Section, Todo } from "@/components/row";

/**
 * Home. One narrow column, left-aligned, no hero: a name, a role line,
 * then labelled lists. Everything on it is shown, not explained; the
 * prose lines are Emily's to write (see TODOs).
 */
export default function Home() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-16 px-6 py-24">
      <header className="flex flex-col">
        <Name />
        <p className="text-body text-ink-2">
          Design Engineer
          <span className="text-ink-3">, </span>
          <Link
            href="/about"
            className="press inline-block text-ink-2 no-underline transition-colors duration-(--duration-fast) hover:text-ink"
          >
            about
          </Link>
        </p>
      </header>

      <Section title={<NowLabel />}>
        <p className="text-body text-ink-2">
          At IDEXX, building features end to end. Living with my husband and 6 year old
          Shorkie, Cricket.
        </p>
      </Section>

      <Section title="Work">
        <List>
          <Row href="/work/basin" title="Basin" tags={["Consumer wellness", "iOS app"]}>
            A skincare companion app that tracks one product at a time, with your face as the evidence
          </Row>
          <Row href="/work/easy-care" title="Easy Care" tags={["B2B", "Web application"]}>
            A platform that lets vet clinics enroll a pet in a year of preventive care, in one visit
          </Row>
        </List>
      </Section>

      {/* History: the resume, abridged. Where, what in plain words, the
          industry as a tag. Emily fills these in; the shape is the point. */}
      <Section title="History">
        <div className="flex flex-col">
          <HistoryRow place="IDEXX" tags={["Veterinary software"]}>
            UX designer and developer. <Todo>TODO(emily): plain words, e.g. I worked on a tvOS app for the waiting room</Todo>
          </HistoryRow>
          <HistoryRow place="Kroll" tags={["Financial and risk advisory"]}>
            Software engineer. <Todo>TODO(emily): plain words, what you built</Todo>
          </HistoryRow>
          <HistoryRow place="Sarah Cannon Research Institute" tags={["Cancer research, HCA Healthcare"]}>
            Application engineer on a full-stack design and development team, building enterprise
            applications for the cancer institute of HCA Healthcare.
          </HistoryRow>
        </div>
      </Section>

      {/* Contact: three rows, no heading. Email copies on click; the other
          two open in a new tab. */}
      <List>
        <EmailRow address="em.loggins7@gmail.com" />
        <Row href="https://www.linkedin.com/in/emilyloggins" title="LinkedIn" external>
          linkedin.com/in/emilyloggins
        </Row>
        <Row href="https://github.com/emilyloggins" title="GitHub" external>
          github.com/emilyloggins
        </Row>
      </List>
    </main>
  );
}
