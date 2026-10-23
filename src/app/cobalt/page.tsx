import { List } from "@/components/list";
import { Name } from "@/components/name";
import { Row, Section } from "@/components/row";
import "./cobalt.css";

export const metadata = { title: "Cobalt" };

/**
 * Five rules for where cobalt goes, each shown on the same small page.
 * A working page, not a mock: hover, select text, tab through. Pick one
 * (or 1 + 3), then this route is deleted.
 */
function Demo({
  id,
  n,
  title,
  rule,
  children,
}: {
  id: string;
  n: number;
  title: string;
  rule: string;
  children: React.ReactNode;
}) {
  return (
    <section data-demo={id} className="flex flex-col gap-8 border-t border-line py-14">
      <header className="flex flex-col gap-1">
        <p className="text-meta text-ink-3">{n}</p>
        <h2 className="text-title font-medium text-ink">{title}</h2>
        <p className="text-body text-ink-2">{rule}</p>
      </header>
      <div className="flex flex-col gap-12 rounded-md px-1">{children}</div>
    </section>
  );
}

function MiniHome({ nowClass = "", oneClass = "" }: { nowClass?: string; oneClass?: string }) {
  return (
    <>
      <header className="flex flex-col">
        <span className={oneClass}>
          <Name link />
        </span>
        <p className="text-body text-ink-2">Product designer who ships.</p>
      </header>
      <Section
        title={
          <>
            Now<span className={`font-normal text-ink-3 ${nowClass}`}>, 3:34 pm in Brooklyn</span>
          </>
        }
      >
        <p className="text-body text-ink-2">
          Building Basin, a skincare tracker, and this site. Select this sentence to see the
          selection colour.
        </p>
      </Section>
      <Section title="Work">
        <List>
          <Row href="#" title="Basin">
            Your skincare, tested on the only face that matters.
          </Row>
          <Row href="#" title="Easy Care">
            A year-long wellness plan, enrolled in minutes.
          </Row>
        </List>
      </Section>
    </>
  );
}

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col px-6 py-24">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Where cobalt goes</h1>
        <p className="text-body text-ink-2">
          Five rules, same page each time. Hover, select, tab. Scroll.
        </p>
      </header>

      <Demo id="responding" n={1} title="Responding to you" rule="Only things that react: the hover highlight, selection, focus, Copied, the name as it thickens. Static text never.">
        <MiniHome />
        <Section title="Elsewhere">
          <List>
            <Row href="#" title="GitHub" />
            <a href="#" data-row className="press -mx-3 flex min-h-[4.25rem] flex-col justify-center rounded-sm px-3 no-underline">
              <span className="text-body text-ink">Email</span>
              <span className="copied text-body">Copied</span>
            </a>
          </List>
        </Section>
      </Demo>

      <Demo id="live" n={2} title="Live" rule="Only data the page computed: the clock, counts, last commit. A blue number is true right now.">
        <MiniHome nowClass="live" />
        <p className="text-meta text-ink-3">
          <span className="live">2</span> projects · <span className="live">31</span> decisions · last commit{" "}
          <span className="live">3 days ago</span>
        </p>
      </Demo>

      <Demo id="mycall" n={3} title="My call" rule="The ★ on a decision that was mine, and nothing else on the site.">
        <MiniHome />
        <Section title="Decisions">
          <div className="flex flex-col gap-6 border-t border-line pt-6">
            {[
              ["One timeline, not parallel trials", "Aug 1", true],
              ["Four-week check-in, not none", "Oct 13", true],
              ["Static export, no server", "Aug 6", false],
            ].map(([q, d, mine]) => (
              <div key={q as string} className="flex items-baseline justify-between gap-6">
                <p className="text-body text-ink">
                  {mine ? <span className="star mr-2">★</span> : <span className="mr-2 text-ink-3">·</span>}
                  {q as string}
                </p>
                <span className="text-meta text-ink-3">{d as string}</span>
              </div>
            ))}
          </div>
        </Section>
      </Demo>

      <Demo id="one" n={4} title="One object" rule="Exactly one blue thing in view at any time. Here, the name; on a case study, the title; on /decisions, the active filter.">
        <MiniHome oneClass="one [&_.name-a]:text-accent" />
      </Demo>

      <Demo id="material" n={5} title="In the material" rule="Every word stays ink. The hairlines and the paper itself are faintly cobalt, so the page reads blueprint-adjacent.">
        <hr />
        <MiniHome />
        <hr />
      </Demo>
    </main>
  );
}
