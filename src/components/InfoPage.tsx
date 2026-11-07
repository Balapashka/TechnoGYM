import type { InfoContent } from "@/lib/pages";
import { LEGAL_UPDATED } from "@/lib/pages";
import type { StoreSettings } from "@/lib/settings-shape";
import { BRAND_NAME } from "@/lib/brand";
import { InfoContacts, InfoContactForm, InfoUpdated } from "@/components/InfoPageParts";
import { Media } from "@/components/ui/Media";

/** Generic content page used for all informational and legal routes. */
export function InfoPage({
  content,
  settings,
}: {
  content: InfoContent;
  settings: StoreSettings;
}) {
  const requisites = [
    settings.legalName,
    settings.inn && `ИНН ${settings.inn}`,
    settings.ogrn && `ОГРН ${settings.ogrn}`,
    settings.legalAddress,
  ].filter(Boolean);

  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-stone bg-mist">
        <div className="container-page py-12 md:py-14">
          <p className="text-xs uppercase tracking-wide text-ink-soft">{BRAND_NAME}</p>
          <h1 className="break-words text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-soft">{content.lead}</p>
          {content.legal && <InfoUpdated date={LEGAL_UPDATED} />}
        </div>
      </div>

      {(content.contacts || content.form) && (
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.2fr]">
          {content.contacts && <InfoContacts settings={settings} />}
          {content.form && <InfoContactForm />}
          {!content.form && content.image && (
            <Media
              src={content.image}
              alt={content.title}
              aspect="4/3"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="self-start rounded-2xl"
            />
          )}
        </div>
      )}

      {content.sections.length > 0 && (
        <div className="container-page py-12">
        <div
          className={
            content.legal
              ? "max-w-3xl space-y-8"
              : "grid gap-x-12 gap-y-8 md:grid-cols-2"
          }
        >
          {content.sections.map((s) => (
            <section key={s.heading} className="min-w-0">
              <h2 className="mb-3 text-lg font-bold uppercase md:text-xl">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="mb-3 break-words text-ink-soft">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="list-disc space-y-1.5 pl-5 text-ink-soft">
                  {s.list.map((item) => (
                    <li key={item} className="break-words">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
        </div>
      )}

      {content.legal && requisites.length > 0 && (
        <div className="container-page pb-16">
          <p className="max-w-3xl rounded-xl bg-mist p-4 text-sm text-ink-soft">
            {requisites.join(" · ")}
          </p>
        </div>
      )}
    </main>
  );
}
