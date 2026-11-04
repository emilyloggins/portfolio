import { Name } from "@/components/name";
import Content from "../../../../content/work/basin.mdx";

export const metadata = { title: "Basin" };

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-8 px-6 py-24">
      <nav>
        <Name as="p" href="/" />
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Basin</h1>
        <p className="text-body text-ink-2">
          A skincare companion app that tells you what actually worked
        </p>
      </header>
      <article className="flex flex-col gap-6" data-accent="lime">
        <Content />
      </article>
    </main>
  );
}
