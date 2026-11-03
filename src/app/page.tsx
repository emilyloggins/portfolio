import { EmailRow } from "@/components/email-row";
import { List } from "@/components/list";
import { Name } from "@/components/name";
import { NowLabel } from "@/components/now-label";
import { Row, Section } from "@/components/row";

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
        <p className="text-body text-ink-2">Design Engineer</p>
      </header>

      <Section title={<NowLabel />}>
        <p className="text-body text-ink-2">
          At IDEXX, building features end to end. Often not talking to anyone all day. I guess
          this is how it is now!
        </p>
      </Section>

      <Section title="Work">
        <List>
          <Row href="/work/basin" title="Basin">
            A skincare companion app
          </Row>
          <Row href="/work/easy-care" title="Easy Care">
            A year of your pet&apos;s preventive care, set up in one vet visit
          </Row>
        </List>
      </Section>

      {/* Contact is one line, not a section: the email, copy on click. */}
      <List>
        <EmailRow address="em.loggins7@gmail.com" />
      </List>
    </main>
  );
}
