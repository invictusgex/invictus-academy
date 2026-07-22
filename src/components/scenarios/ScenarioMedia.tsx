import Image from "next/image";

type ScenarioMediaProps = {
  documentUrl: string | null;
  thumbnailUrl: string | null;
  title: string;
  videoEmbedUrl: string | null;
  videoUrl: string | null;
};

export function ScenarioMedia({
  documentUrl,
  thumbnailUrl,
  title,
  videoEmbedUrl,
  videoUrl,
}: ScenarioMediaProps) {
  return (
    <div className="grid gap-4">
      {thumbnailUrl ? (
        <Image
          alt={`Captura de ${title}`}
          className="max-h-[24rem] w-full rounded-2xl border border-[var(--color-border)] object-cover"
          height={720}
          src={thumbnailUrl}
          unoptimized
          width={1280}
        />
      ) : null}

      {videoEmbedUrl ? (
        <div className="aspect-video overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full"
            referrerPolicy="strict-origin-when-cross-origin"
            src={videoEmbedUrl}
            title={`Video de ${title}`}
          />
        </div>
      ) : null}

      {!videoEmbedUrl && videoUrl ? (
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit"
          href={videoUrl}
          rel="noreferrer"
          target="_blank"
        >
          Ver video
        </a>
      ) : null}

      {documentUrl ? (
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:w-fit"
          href={documentUrl}
          rel="noreferrer"
          target="_blank"
        >
          Abrir documento
        </a>
      ) : null}
    </div>
  );
}
