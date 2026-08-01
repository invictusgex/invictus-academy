import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { ModuleReflectionRepository } from "@/lib/repositories/module-reflection.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { evaluateEnrollmentAccess } from "@/lib/services/enrollment.service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  ModuleReflection,
  ModuleReflectionRow,
} from "@/lib/types/module-reflection.types";

export const MODULE_REFLECTION_ERROR_CODES = {
  ACTIVE_ENROLLMENT_REQUIRED: "ACTIVE_ENROLLMENT_REQUIRED",
  INVALID_REFLECTION_PAYLOAD: "INVALID_REFLECTION_PAYLOAD",
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

    return reflection ? mapModuleReflection(reflection) : null;
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

    return mapModuleReflection(reflection);
  },
};
