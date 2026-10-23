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
        <h1 className="text-body font-medium text-ink">Emily Loggins</h1>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): role line, a few words</Todo>
        </p>
      </header>

      <Section title="Now">
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): two or three sentences on what you are doing now</Todo>
        </p>
      </Section>

      <Section title="Work">
        <Row href="/work/basin" title="Basin">
          Your skincare, tested on the only face that matters.
        </Row>
        <Row href="/work/easy-care" title="Easy Care">
          <Todo>TODO(emily): one line</Todo>
        </Row>
      </Section>

      <Section title="Elsewhere">
        <Row href="https://github.com/emilyloggins" title="GitHub" external />
        <Row href="https://www.instagram.com/gildedwhim" title="@gildedwhim" external />
        <Row href="mailto:em.loggins7@gmail.com" title="Email" external />
      </Section>
    </main>
  );
}
