import { EmailRow } from "@/components/email-row";
import { List } from "@/components/list";
import { Name } from "@/components/name";
import { NowLabel } from "@/components/now-label";
import { Row, Section, Todo } from "@/components/row";

/**
 * Home. One narrow column, left-aligned, no hero: a name, a role line,
 * then labelled lists. Everything on it is shown, not explained; the
 * prose lines are Emily's to write (see TODOs).
 */
export default function Home() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-16 px-6 py-24">
      <header className="flex flex-col">
        <Name link={false} />
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): role line, a few words</Todo>
        </p>
      </header>

      <Section title={<NowLabel />}>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): two or three sentences on what you are doing now</Todo>
        </p>
      </Section>

      <Section title="Work">
        <List>
          <Row href="/work/basin" title="Basin">
            Your skincare, tested on the only face that matters.
          </Row>
          <Row href="/work/easy-care" title="Easy Care">
            <Todo>TODO(emily): one line</Todo>
          </Row>
        </List>
      </Section>

      <Section title="Elsewhere">
        <List>
          <Row href="https://github.com/emilyloggins" title="GitHub" external />
          <Row href="https://www.instagram.com/gildedwhim" title="@gildedwhim" external />
          <EmailRow address="em.loggins7@gmail.com" />
        </List>
      </Section>
    </main>
  );
}
