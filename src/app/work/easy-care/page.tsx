import Link from "next/link";
import { Name } from "@/components/name";
import Content from "../../../../content/work/easy-care.mdx";

export const metadata = { title: "Easy Care" };

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-8 px-6 py-24">
      <Link
        href="/"
        className="press fixed top-6 left-6 z-20 inline-flex items-center gap-1.5 text-meta text-ink-3 no-underline transition-colors duration-(--duration-fast) hover:text-ink"
      >
        <span aria-hidden>←</span> Home
      </Link>
      <nav>
        <Name as="p" />
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Easy Care</h1>
        <p className="text-body text-ink-2">
          A year of your pet&apos;s preventive care, set up in one vet visit.
        </p>
      </header>
      <article className="flex flex-col gap-6">
        <Content />
      </article>
    </main>
  );
}
