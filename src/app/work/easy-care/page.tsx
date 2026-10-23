import { Name } from "@/components/name";
import { Todo } from "@/components/row";

export const metadata = { title: "Easy Care" };

export default function Page() {
  return (
    <main className="arrive mx-auto flex w-full max-w-[34rem] flex-1 flex-col gap-16 px-6 py-24">
      <nav>
        <Name />
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="text-title font-medium text-ink">Easy Care</h1>
        <p className="text-body text-ink-2">
          <Todo>TODO(emily): the case study lands here</Todo>
        </p>
      </header>
    </main>
  );
}
