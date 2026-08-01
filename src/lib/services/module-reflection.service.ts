import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { ModuleReflectionRepository } from "@/lib/repositories/module-reflection.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { StorageRepository } from "@/lib/repositories/storage.repository";
import { evaluateEnrollmentAccess } from "@/lib/services/enrollment.service";
import { StorageService } from "@/lib/services/storage.service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ModuleReflection,
  ModuleReflectionAttachment,
  ModuleReflectionAttachmentRow,
  ModuleReflectionScope,
  ModuleReflectionRow,
} from "@/lib/types/module-reflection.types";

export const MODULE_REFLECTION_ERROR_CODES = {
  ACTIVE_ENROLLMENT_REQUIRED: "ACTIVE_ENROLLMENT_REQUIRED",
  ATTACHMENT_LIMIT_REACHED: "ATTACHMENT_LIMIT_REACHED",
  ATTACHMENT_NOT_FOUND: "ATTACHMENT_NOT_FOUND",
  INVALID_REFLECTION_PAYLOAD: "INVALID_REFLECTION_PAYLOAD",
  INVALID_REFLECTION_ATTACHMENT: "INVALID_REFLECTION_ATTACHMENT",
  MODULE_NOT_FOUND: "MODULE_NOT_FOUND",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
} as const;

type ModuleReflectionErrorCode =
  (typeof MODULE_REFLECTION_ERROR_CODES)[keyof typeof MODULE_REFLECTION_ERROR_CODES];

export class ModuleReflectionServiceError extends Error {
  readonly code: ModuleReflectionErrorCode;
  readonly status: number;

  constructor(code: ModuleReflectionErrorCode, message: string, status = 400) {
    super(message);
    this.name = "ModuleReflectionServiceError";
    this.code = code;
    this.status = status;
  }
}

type ModuleReflectionScopeInput = {
  moduleKey: string;
  productSlug: string;
  profileId: string;
};

type SaveModuleReflectionInput = ModuleReflectionScopeInput & {
  content: string;
};

type UploadModuleReflectionAttachmentInput = ModuleReflectionScopeInput & {
  file: File;
};

type DeleteModuleReflectionAttachmentInput = ModuleReflectionScopeInput & {
  attachmentId: string;
};

const maxReflectionAttachments = 5;

function normalizeRequiredText(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      `${fieldName} es requerido.`,
      400,
    );
  }

  return normalized;
}

function normalizeReflectionContent(value: string) {
  const normalized = value.trim();

  if (normalized.length > 12000) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_PAYLOAD,
      "La reflexion no puede superar 12000 caracteres.",
      400,
    );
  }

  return normalized;
}

function mapModuleReflection(row: ModuleReflectionRow): ModuleReflection {
  return {
    content: row.content,
    createdAt: row.created_at,
    enrollmentId: row.enrollment_id,
    id: row.id,
    moduleKey: row.module_key,
    productId: row.product_id,
    profileId: row.profile_id,
    updatedAt: row.updated_at,
  };
}

async function mapModuleReflectionAttachment(
  row: ModuleReflectionAttachmentRow,
  supabase: SupabaseClient<Database>,
): Promise<ModuleReflectionAttachment> {
  const signedUrl = await StorageRepository.createSignedUrl(
    {
      path: row.storage_path,
    },
    supabase,
  ).catch(() => null);

  return {
    createdAt: row.created_at,
    enrollmentId: row.enrollment_id,
    id: row.id,
    mimeType: row.mime_type,
    moduleKey: row.module_key,
    originalName: row.original_name,
    productId: row.product_id,
    profileId: row.profile_id,
    reflectionId: row.reflection_id,
    signedUrl: signedUrl?.signedUrl ?? null,
    sizeBytes: row.size_bytes,
    storagePath: row.storage_path,
  };
}

async function listMappedAttachments(
  reflectionId: string,
  supabase: SupabaseClient<Database>,
) {
  const attachments = await ModuleReflectionRepository.listAttachmentsByReflection(
    reflectionId,
    supabase,
  );

  return Promise.all(
    attachments.map((attachment) =>
      mapModuleReflectionAttachment(attachment, supabase),
    ),
  );
}

async function mapModuleReflectionWithAttachments(
  row: ModuleReflectionRow,
  supabase: SupabaseClient<Database>,
): Promise<ModuleReflection> {
  return {
    ...mapModuleReflection(row),
    attachments: await listMappedAttachments(row.id, supabase),
  };
}

async function resolveReflectionScope(
  input: ModuleReflectionScopeInput,
  supabase: SupabaseClient<Database>,
) {
  const productSlug = normalizeRequiredText(input.productSlug, "productSlug");
  const moduleKey = normalizeRequiredText(input.moduleKey, "moduleKey");
  const product = await ProductRepository.getBySlug(supabase, productSlug);

  if (!product || product.status !== "active") {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.PRODUCT_NOT_FOUND,
      "No encontramos el producto asociado al modulo.",
      404,
    );
  }

  const moduleRow = await ModuleReflectionRepository.getAvailablePublishedModule(
    {
      moduleKey,
      productId: product.id,
    },
    supabase,
  );

  if (!moduleRow) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.MODULE_NOT_FOUND,
      "No encontramos un modulo disponible con ese identificador.",
      404,
    );
  }

  const enrollment = await EnrollmentRepository.getEnrollmentByProductId(
    {
      productId: product.id,
      profileId: input.profileId,
    },
    supabase,
  );
  const access = evaluateEnrollmentAccess(enrollment);

  if (!access.hasAccess) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Necesitas un enrollment activo para documentar esta reflexion.",
      403,
    );
  }

  return {
    enrollment: access.enrollment,
    moduleKey,
    product,
  };
}

async function getOrCreateReflectionForScope(
  scope: {
    enrollment: { id: string };
    moduleKey: string;
    product: { id: string };
  },
  profileId: string,
  supabase: SupabaseClient<Database>,
) {
  const reflectionScope: ModuleReflectionScope = {
    enrollmentId: scope.enrollment.id,
    moduleKey: scope.moduleKey,
    productId: scope.product.id,
    profileId,
  };
  const existingReflection = await ModuleReflectionRepository.getByScope(
    reflectionScope,
    supabase,
  );

  if (existingReflection) {
    return existingReflection;
  }

  return ModuleReflectionRepository.upsertReflection(
    {
      ...reflectionScope,
      content: "",
    },
    supabase,
  );
}

function validateAttachmentFile(file: File) {
  const validation = StorageService.validateFile({
    file,
    filename: file.name,
    kind: "reflection_image",
  });

  if (!validation.ok) {
    throw new ModuleReflectionServiceError(
      MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_ATTACHMENT,
      validation.message,
      400,
    );
  }
}

export const ModuleReflectionService = {
  async getModuleReflection(
    input: ModuleReflectionScopeInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflection | null> {
    const scope = await resolveReflectionScope(input, supabase);
    const reflection = await ModuleReflectionRepository.getByScope(
      {
        enrollmentId: scope.enrollment.id,
        moduleKey: scope.moduleKey,
        productId: scope.product.id,
        profileId: input.profileId,
      },
      supabase,
    );

    return reflection
      ? mapModuleReflectionWithAttachments(reflection, supabase)
      : null;
  },

  async saveModuleReflection(
    input: SaveModuleReflectionInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflection> {
    const content = normalizeReflectionContent(input.content);
    const scope = await resolveReflectionScope(input, supabase);
    const reflection = await ModuleReflectionRepository.upsertReflection(
      {
        content,
        enrollmentId: scope.enrollment.id,
        moduleKey: scope.moduleKey,
        productId: scope.product.id,
        profileId: input.profileId,
      },
      supabase,
    );

    return mapModuleReflectionWithAttachments(reflection, supabase);
  },

  async uploadModuleReflectionAttachment(
    input: UploadModuleReflectionAttachmentInput,
    supabase: SupabaseClient<Database>,
  ): Promise<ModuleReflectionAttachment> {
    validateAttachmentFile(input.file);

    const scope = await resolveReflectionScope(input, supabase);
    const reflection = await getOrCreateReflectionForScope(
      scope,
      input.profileId,
      supabase,
    );
    const attachmentCount =
      await ModuleReflectionRepository.countAttachmentsByReflection(
        reflection.id,
        supabase,
      );

    if (attachmentCount >= maxReflectionAttachments) {
      throw new ModuleReflectionServiceError(
        MODULE_REFLECTION_ERROR_CODES.ATTACHMENT_LIMIT_REACHED,
        "Solo puedes adjuntar hasta 5 imagenes por reflexion.",
        400,
      );
    }

    const storagePath = StorageService.createReflectionStoragePath({
      filename: input.file.name,
      profileId: input.profileId,
      reflectionId: reflection.id,
    });
    let storedPath: string | null = null;

    try {
      storedPath = await StorageRepository.uploadFile(
        {
          contentType: input.file.type,
          file: input.file,
          path: storagePath,
        },
        supabase,
      );

      const attachment = await ModuleReflectionRepository.createAttachment(
        {
          enrollmentId: scope.enrollment.id,
          mimeType: input.file.type,
          moduleKey: scope.moduleKey,
          originalName: input.file.name,
          productId: scope.product.id,
          profileId: input.profileId,
          reflectionId: reflection.id,
          sizeBytes: input.file.size,
          storagePath: storedPath,
        },
        supabase,
      );

      return mapModuleReflectionAttachment(attachment, supabase);
    } catch (error) {
      if (storedPath) {
        await StorageRepository.deleteFile({ path: storedPath }, supabase).catch(
          () => undefined,
        );
      }

      if (error instanceof ModuleReflectionServiceError) {
        throw error;
      }

      throw new ModuleReflectionServiceError(
        MODULE_REFLECTION_ERROR_CODES.INVALID_REFLECTION_ATTACHMENT,
        "No se pudo adjuntar la imagen.",
        500,
      );
    }
  },

  async deleteModuleReflectionAttachment(
    input: DeleteModuleReflectionAttachmentInput,
    supabase: SupabaseClient<Database>,
  ): Promise<void> {
    const attachmentId = normalizeRequiredText(
      input.attachmentId,
      "attachmentId",
    );
    const scope = await resolveReflectionScope(input, supabase);
    const reflection = await ModuleReflectionRepository.getByScope(
      {
        enrollmentId: scope.enrollment.id,
        moduleKey: scope.moduleKey,
        productId: scope.product.id,
        profileId: input.profileId,
      },
      supabase,
    );

    if (!reflection) {
      throw new ModuleReflectionServiceError(
        MODULE_REFLECTION_ERROR_CODES.ATTACHMENT_NOT_FOUND,
        "No encontramos la reflexion asociada al adjunto.",
        404,
      );
    }

    const attachment = await ModuleReflectionRepository.getAttachmentById(
      {
        attachmentId,
        profileId: input.profileId,
      },
      supabase,
    );

    if (!attachment || attachment.reflection_id !== reflection.id) {
      throw new ModuleReflectionServiceError(
        MODULE_REFLECTION_ERROR_CODES.ATTACHMENT_NOT_FOUND,
        "No encontramos la imagen solicitada.",
        404,
      );
    }

    await ModuleReflectionRepository.deleteAttachmentById(
      {
        attachmentId,
        profileId: input.profileId,
      },
      supabase,
    );
    await StorageRepository.deleteFile(
      { path: attachment.storage_path },
      supabase,
    ).catch(() => undefined);
  },
};
