import Link from "next/link";
import { Name } from "@/components/name";
import { Todo } from "@/components/row";
import Content from "../../../../content/work/basin.mdx";

export const metadata = { title: "Basin" };

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-8 px-6 py-24">
      <nav className="flex items-baseline gap-4">
        <Name as="p" />
        <Link href="/" className="press text-meta text-ink-3 no-underline hover:text-ink">
          Home
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Basin</h1>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): one line, what it is</Todo>
        </p>
      </header>
      <article className="flex flex-col gap-6">
        <Content />
      </article>
    </main>
  );
}
