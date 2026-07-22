export const academyAssetsBucket = "academy-assets" as const;
export const defaultSignedUrlDurationSeconds = 300;

export const academyAssetPathPrefixValues = [
  "modules/thumbnails",
  "scenarios/thumbnails",
  "resources/pdf",
  "resources/docs",
  "resources/images",
] as const;

export type AcademyAssetsBucket = typeof academyAssetsBucket;
export type AcademyAssetPathPrefix =
  (typeof academyAssetPathPrefixValues)[number];

export type AcademyAssetKind =
  | "module_thumbnail"
  | "resource_doc"
  | "resource_image"
  | "resource_pdf"
  | "scenario_thumbnail";

export type StorageFileBody = Blob | File;

export type StorageValidationRule = {
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  pathPrefix: AcademyAssetPathPrefix;
};

export type StorageValidationResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type CreateStoragePathInput = {
  fileId?: string;
  filename: string;
  kind: AcademyAssetKind;
};

export type StorageUploadInput = {
  contentType?: string;
  file: StorageFileBody;
  path: string;
  upsert?: boolean;
};

export type StorageDeleteInput = {
  path: string;
};

export type StorageReplaceInput = {
  contentType?: string;
  file: StorageFileBody;
  path: string;
};

export type StorageSignedUrlInput = {
  expiresInSeconds?: number;
  path: string;
};

export type StorageSignedUrlResult = {
  expiresAt: Date;
  expiresInSeconds: number;
  path: string;
  signedUrl: string;
};

export type StorageMutationResult =
  | {
      ok: true;
      path: string;
    }
  | {
      message: string;
      ok: false;
    };
