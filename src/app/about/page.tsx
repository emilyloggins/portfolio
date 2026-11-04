import { EmailRow } from "@/components/email-row";
import { List } from "@/components/list";
import { Name } from "@/components/name";
import { Row, Section, Todo } from "@/components/row";

export const metadata = { title: "About" };

/**
 * About. The same column as home: the name (a link home), one heading,
 * a few paragraphs in Emily's words, and the three ways to reach her.
 * Every paragraph is a placeholder until she writes it.
 */
export default function About() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-16 px-6 py-24">
      <header className="flex flex-col">
        <Name as="p" href="/" />
        <h1 className="text-body text-ink-2">About</h1>
      </header>

      <div className="flex flex-col gap-4">
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): who you are in two sentences. Design engineer at IDEXX, Brooklyn, the kind of work you like.</Todo>
        </p>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): how you work. The whole loop, research to React to ship; AI in the room but never holding the pen.</Todo>
        </p>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): before this. Music school, theatre and chorus, comedy; Nashville to Brooklyn; the creator brand, if you want it here.</Todo>
        </p>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): outside work. Cricket the shorkie, and whatever else.</Todo>
        </p>
      </div>

      <Section title="Elsewhere">
        <List>
          <EmailRow address="em.loggins7@gmail.com" />
          <Row href="https://www.linkedin.com/in/TODO-emily" title="LinkedIn" external>
            TODO(emily): your LinkedIn handle in the href
          </Row>
          <Row href="https://github.com/emilyloggins" title="GitHub" external>
            github.com/emilyloggins
          </Row>
        </List>
      </Section>
    </main>
  );
}
