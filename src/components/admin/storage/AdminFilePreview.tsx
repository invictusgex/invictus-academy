"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { StorageService } from "@/lib/services/storage.service";
import type { AcademyAssetKind } from "@/lib/types/storage.types";

type AdminFilePreviewProps = {
  allowedKinds: AcademyAssetKind[];
  alt: string;
  localPreviewUrl: string | null;
  mode: "document" | "image";
  value: string;
};

export function AdminFilePreview({
  allowedKinds,
  alt,
  localPreviewUrl,
  mode,
  value,
}: AdminFilePreviewProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function resolvePreview() {
      if (localPreviewUrl) {
        setResolvedUrl(localPreviewUrl);
        return;
      }

      const resolved = await StorageService.resolveAssetUrl({
        allowedKinds,
        value,
      });

      if (isActive) {
        setResolvedUrl(resolved?.url ?? null);
      }
    }

    void resolvePreview();

    return () => {
      isActive = false;
    };
  }, [allowedKinds, localPreviewUrl, value]);

  if (!resolvedUrl) {
    return null;
  }

  if (mode === "image") {
    return (
      <Image
        alt={alt}
        className="h-40 w-full max-w-sm rounded-lg border border-[var(--color-border)] object-cover"
        height={160}
        src={resolvedUrl}
        unoptimized
        width={384}
      />
    );
  }

  return (
    <a
      className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--color-border)] px-4 text-xs font-semibold text-white transition hover:border-[var(--color-cyan)]"
      href={resolvedUrl}
      rel="noreferrer"
      target="_blank"
    >
      Abrir archivo actual
    </a>
  );
}
