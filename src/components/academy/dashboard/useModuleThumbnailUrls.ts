"use client";

import { useEffect, useState } from "react";

import { StorageService } from "@/lib/services/storage.service";

type ModuleThumbnailInput = {
  id: string;
  thumbnailUrl: string | null;
};

export function useModuleThumbnailUrls(inputs: ModuleThumbnailInput[]) {
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isActive = true;

    async function resolveThumbnails() {
      const nextThumbnailUrls: Record<string, string> = {};
      const thumbnailPaths = new Map<string, string[]>();

      for (const { id, thumbnailUrl } of inputs) {
        if (!thumbnailUrl) {
          continue;
        }

        if (StorageService.isExternalAssetUrl(thumbnailUrl)) {
          nextThumbnailUrls[id] = thumbnailUrl;
          continue;
        }

        thumbnailPaths.set(thumbnailUrl, [
          ...(thumbnailPaths.get(thumbnailUrl) ?? []),
          id,
        ]);
      }

      const resolvedEntries = await Promise.all(
        Array.from(thumbnailPaths.entries()).map(async ([thumbnailUrl, ids]) => {
          const resolved = await StorageService.resolveAssetUrl({
            allowedKinds: ["module_thumbnail"],
            value: thumbnailUrl,
          });

          return ids.map((id) => [id, resolved?.url ?? ""] as const);
        }),
      );

      if (!isActive) {
        return;
      }

      for (const [id, thumbnailUrl] of resolvedEntries.flat()) {
        if (thumbnailUrl) {
          nextThumbnailUrls[id] = thumbnailUrl;
        }
      }

      setThumbnailUrls(nextThumbnailUrls);
    }

    void resolveThumbnails();

    return () => {
      isActive = false;
    };
  }, [inputs]);

  return thumbnailUrls;
}
