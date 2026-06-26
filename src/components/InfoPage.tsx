import type { InfoContent } from "@/lib/pages";

/** Generic content page used for all informational routes. */
export function InfoPage({ content }: { content: InfoContent }) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-stone bg-mist">
        <div className="container-page py-14">
          <p className="text-xs uppercase tracking-wide text-ink-soft">
            Movigym
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{content.lead}</p>
        </div>
      </div>

      <div className="container-page grid gap-8 py-12 md:grid-cols-2">
        {(content.sections ?? defaultSections).map((s) => (
          <section key={s.heading}>
            <h2 className="mb-2 text-xl font-bold uppercase">{s.heading}</h2>
            <p className="text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>

      <div className="container-page pb-16">
        <p className="rounded bg-mist p-4 text-sm text-ink-soft">
          This is an educational demo page with generic placeholder content.
        </p>
      </div>
    </main>
  );
}

const defaultSections: NonNullable<InfoContent["sections"]> = [
  {
    heading: "Placeholder section",
    body: "Generic demo copy. Replace with real content when needed.",
  },
  {
    heading: "Another section",
    body: "More generic demo copy to fill the layout.",
  },
];
