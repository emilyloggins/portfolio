import { Name } from "@/components/name";
import Content from "../../../../content/work/easy-care.mdx";

export const metadata = { title: "Easy Care" };

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-8 px-6 py-24">
      <nav>
        <Name as="p" href="/" />
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Easy Care</h1>
        <p className="text-body text-ink-2">
          A platform that lets vet clinics enroll a pet in a year of preventive care, in one visit
        </p>
      </header>
      <article className="flex flex-col gap-6">
        <Content />
      </article>
    </main>
  );
}
