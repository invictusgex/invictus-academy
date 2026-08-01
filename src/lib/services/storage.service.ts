import { StorageRepository } from "@/lib/repositories/storage.repository";
import type {
  AcademyAssetKind,
  AcademyAssetPathPrefix,
  CreateStoragePathInput,
  StorageFileBody,
  StorageMutationResult,
  StorageResolvedAsset,
  StorageSignedUrlResult,
  StorageValidationResult,
  StorageValidationRule,
} from "@/lib/types/storage.types";
import { academyAssetPathPrefixValues } from "@/lib/types/storage.types";
import { defaultSignedUrlDurationSeconds } from "@/lib/types/storage.types";

const pathPrefixByKind: Record<AcademyAssetKind, AcademyAssetPathPrefix> = {
  module_thumbnail: "modules/thumbnails",
  resource_doc: "resources/docs",
  resource_image: "resources/images",
  resource_pdf: "resources/pdf",
  reflection_image: "reflections",
  scenario_thumbnail: "scenarios/thumbnails",
};

const validationRules: Record<AcademyAssetKind, StorageValidationRule> = {
  module_thumbnail: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 2 * 1024 * 1024,
    pathPrefix: "modules/thumbnails",
  },
  resource_doc: {
    allowedExtensions: ["doc", "docx", "pdf"],
    allowedMimeTypes: [
      "application/msword",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSizeBytes: 20 * 1024 * 1024,
    pathPrefix: "resources/docs",
  },
  resource_image: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 5 * 1024 * 1024,
    pathPrefix: "resources/images",
  },
  resource_pdf: {
    allowedExtensions: ["pdf"],
    allowedMimeTypes: ["application/pdf"],
    maxSizeBytes: 20 * 1024 * 1024,
    pathPrefix: "resources/pdf",
  },
  reflection_image: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 8 * 1024 * 1024,
    pathPrefix: "reflections",
  },
  scenario_thumbnail: {
    allowedExtensions: ["jpg", "jpeg", "png", "webp"],
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxSizeBytes: 3 * 1024 * 1024,
    pathPrefix: "scenarios/thumbnails",
  },
};

const signedUrlCacheBufferMs = 30 * 1000;
const signedUrlCache = new Map<
  string,
  {
    result: StorageSignedUrlResult;
    validUntilMs: number;
  }
>();
const pendingSignedUrlRequests = new Map<
  string,
  Promise<StorageSignedUrlResult | null>
>();

function createUuid() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function getExtension(filename: string) {
  const sanitized = StorageService.sanitizeFilename(filename);
  const parts = sanitized.split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

function isAllowedPath(path: string) {
  return StorageService.isInternalStoragePath(path);
}

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createSignedUrlCacheKey(path: string, expiresInSeconds: number) {
  return `${expiresInSeconds}:${path}`;
}

function getCachedSignedUrl(cacheKey: string) {
  const cached = signedUrlCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (Date.now() + signedUrlCacheBufferMs >= cached.validUntilMs) {
    signedUrlCache.delete(cacheKey);
    return null;
  }

  return cached.result;
}

function deleteSignedUrlCacheEntry(path: string) {
  for (const cacheKey of signedUrlCache.keys()) {
    if (cacheKey.endsWith(`:${path}`)) {
      signedUrlCache.delete(cacheKey);
    }
  }

  for (const cacheKey of pendingSignedUrlRequests.keys()) {
    if (cacheKey.endsWith(`:${path}`)) {
      pendingSignedUrlRequests.delete(cacheKey);
    }
  }
}

export const StorageService = {
  getValidationRule(kind: AcademyAssetKind) {
    return validationRules[kind];
  },

  formatFileSize(sizeBytes: number) {
    if (sizeBytes >= 1024 * 1024) {
      return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  },

  sanitizeFilename(filename: string) {
    return filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  generateUniqueFilename(filename: string, fileId = createUuid()) {
    const extension = getExtension(filename);

    return extension ? `${fileId}.${extension}` : fileId;
  },

  createStoragePath(input: CreateStoragePathInput) {
    const prefix = pathPrefixByKind[input.kind];
    const filename = StorageService.generateUniqueFilename(
      input.filename,
      input.fileId,
    );

    return `${prefix}/${filename}`;
  },

  createReflectionStoragePath({
    filename,
    profileId,
    reflectionId,
  }: {
    filename: string;
    profileId: string;
    reflectionId: string;
  }) {
    const sanitizedFilename = StorageService.sanitizeFilename(filename) || "image";
    const uniqueFilename = `${createUuid()}-${sanitizedFilename}`;

    return `reflections/${profileId}/${reflectionId}/${uniqueFilename}`;
  },

  determineAssetKindFromFile(file: StorageFileBody, filename: string) {
    const extension = getExtension(filename);
    const mimeType = file.type;

    if (mimeType === "application/pdf" || extension === "pdf") {
      return "resource_pdf" as const;
    }

    if (mimeType.startsWith("image/")) {
      return "resource_image" as const;
    }

    if (["doc", "docx"].includes(extension)) {
      return "resource_doc" as const;
    }

    return null;
  },

  isExternalAssetUrl(value: string) {
    return isSafeHttpUrl(value);
  },

  isInternalStoragePath(path: string) {
    if (
      !path ||
      path.startsWith("/") ||
      path.includes("\\") ||
      path.includes("..") ||
      path.includes("//") ||
      isSafeHttpUrl(path)
    ) {
      return false;
    }

    return academyAssetPathPrefixValues.some((prefix) =>
      path.startsWith(`${prefix}/`),
    );
  },

  validatePathForAssetKind(path: string, kind: AcademyAssetKind) {
    return (
      StorageService.isInternalStoragePath(path) &&
      path.startsWith(`${pathPrefixByKind[kind]}/`)
    );
  },

  validatePathForAssetKinds(path: string, kinds: AcademyAssetKind[]) {
    return kinds.some((kind) => StorageService.validatePathForAssetKind(path, kind));
  },

  validateFile({
    file,
    filename,
    kind,
  }: {
    file: StorageFileBody;
    filename: string;
    kind: AcademyAssetKind;
  }): StorageValidationResult {
    const rule = validationRules[kind];
    const extension = getExtension(filename);

    if (!rule.allowedExtensions.includes(extension)) {
      return {
        message: "La extension del archivo no esta permitida.",
        ok: false,
      };
    }

    if (file.type && !rule.allowedMimeTypes.includes(file.type)) {
      return {
        message: "El tipo MIME del archivo no esta permitido.",
        ok: false,
      };
    }

    if (file.size > rule.maxSizeBytes) {
      return {
        message: "El archivo supera el tamano maximo permitido.",
        ok: false,
      };
    }

    return { ok: true };
  },

  async uploadFile({
    file,
    filename,
    kind,
  }: {
    file: StorageFileBody;
    filename: string;
    kind: AcademyAssetKind;
  }): Promise<StorageMutationResult> {
    const validation = StorageService.validateFile({ file, filename, kind });

    if (!validation.ok) {
      return validation;
    }

    try {
      const path = StorageService.createStoragePath({ filename, kind });
      const storedPath = await StorageRepository.uploadFile({
        contentType: file.type || undefined,
        file,
        path,
      });
      deleteSignedUrlCacheEntry(storedPath);

      return {
        ok: true,
        path: storedPath,
      };
    } catch {
      return {
        message: "No fue posible subir el archivo.",
        ok: false,
      };
    }
  },

  async deleteFile(path: string): Promise<StorageMutationResult> {
    if (!isAllowedPath(path)) {
      return {
        message: "La ruta de archivo no esta permitida.",
        ok: false,
      };
    }

    try {
      await StorageRepository.deleteFile({ path });
      deleteSignedUrlCacheEntry(path);

      return {
        ok: true,
        path,
      };
    } catch {
      return {
        message: "No fue posible eliminar el archivo.",
        ok: false,
      };
    }
  },

  async replaceFile({
    file,
    filename,
    kind,
    path,
  }: {
    file: StorageFileBody;
    filename: string;
    kind: AcademyAssetKind;
    path: string;
  }): Promise<StorageMutationResult> {
    if (!isAllowedPath(path)) {
      return {
        message: "La ruta de archivo no esta permitida.",
        ok: false,
      };
    }

    const validation = StorageService.validateFile({ file, filename, kind });

    if (!validation.ok) {
      return validation;
    }

    try {
      const storedPath = await StorageRepository.replaceFile({
        contentType: file.type || undefined,
        file,
        path,
      });
      deleteSignedUrlCacheEntry(storedPath);

      return {
        ok: true,
        path: storedPath,
      };
    } catch {
      return {
        message: "No fue posible reemplazar el archivo.",
        ok: false,
      };
    }
  },

  async createSignedUrl(
    path: string,
    expiresInSeconds = defaultSignedUrlDurationSeconds,
  ): Promise<StorageSignedUrlResult | null> {
    if (!isAllowedPath(path)) {
      return null;
    }

    const cacheKey = createSignedUrlCacheKey(path, expiresInSeconds);
    const cached = getCachedSignedUrl(cacheKey);

    if (cached) {
      return cached;
    }

    const pendingRequest = pendingSignedUrlRequests.get(cacheKey);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = StorageRepository.createSignedUrl({
      expiresInSeconds,
      path,
    })
      .then((result) => {
        signedUrlCache.set(cacheKey, {
          result,
          validUntilMs: result.expiresAt.getTime(),
        });

        return result;
      })
      .catch(() => null)
      .finally(() => {
        pendingSignedUrlRequests.delete(cacheKey);
      });

    pendingSignedUrlRequests.set(cacheKey, request);

    return request;
  },

  async resolveAssetUrl({
    allowedKinds,
    value,
  }: {
    allowedKinds: AcademyAssetKind[];
    value: string | null;
  }): Promise<StorageResolvedAsset | null> {
    if (!value) {
      return null;
    }

    if (StorageService.isExternalAssetUrl(value)) {
      return {
        source: "external",
        url: value,
      };
    }

    if (!StorageService.validatePathForAssetKinds(value, allowedKinds)) {
      return null;
    }

    const signedUrl = await StorageService.createSignedUrl(value);

    if (!signedUrl) {
      return null;
    }

    return {
      path: signedUrl.path,
      source: "internal",
      url: signedUrl.signedUrl,
    };
  },
};
