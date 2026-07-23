"use client";

import { useEffect, useState } from "react";

import { StorageService } from "@/lib/services/storage.service";
import type { ModuleResource } from "@/types/academy";

function getAllowedResourceKinds(resource: ModuleResource) {
  if (resource.resourceType === "pdf") {
    return ["resource_pdf"] as const;
  }

  return ["resource_pdf", "resource_doc", "resource_image"] as const;
}

export function useModuleThumbnailUrl(thumbnailUrl: string | null | undefined) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function resolveThumbnail() {
      const resolved = await StorageService.resolveAssetUrl({
        allowedKinds: ["module_thumbnail"],
        value: thumbnailUrl ?? null,
      });

      if (isActive) {
        setResolvedUrl(resolved?.url ?? null);
      }
    }

    void resolveThumbnail();

    return () => {
      isActive = false;
    };
  }, [thumbnailUrl]);

  return resolvedUrl;
}

export function useModuleResourceUrls(resources: ModuleResource[]) {
  const [resourceUrls, setResourceUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let isActive = true;

    async function resolveResources() {
      const entries = await Promise.all(
        resources.map(async (resource) => {
          if (resource.url && StorageService.isExternalAssetUrl(resource.url)) {
            return [resource.id, resource.url] as const;
          }

          const resolved = await StorageService.resolveAssetUrl({
            allowedKinds: [...getAllowedResourceKinds(resource)],
            value: resource.storagePath ?? null,
          });

          return [resource.id, resolved?.url ?? ""] as const;
        }),
      );

      if (!isActive) {
        return;
      }

      setResourceUrls(
        Object.fromEntries(entries.filter(([, resourceUrl]) => resourceUrl)),
      );
    }

    void resolveResources();

    return () => {
      isActive = false;
    };
  }, [resources]);

  return resourceUrls;
}
