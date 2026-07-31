import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { FormRepository } from "@/lib/repositories/form.repository";
import { ProductRepository } from "@/lib/repositories/product.repository";
import { evaluateEnrollmentAccess } from "@/lib/services/enrollment.service";
import type { Database } from "@/lib/supabase/database.types";
import type {
  FormAnswers,
  FormDefinition,
  FormSubmission,
  FormSubmissionInput,
  RequiredFormsProgress,
} from "@/lib/types/form.types";

export const FORM_ERROR_CODES = {
  ACTIVE_ENROLLMENT_REQUIRED: "ACTIVE_ENROLLMENT_REQUIRED",
  FORM_NOT_FOUND: "FORM_NOT_FOUND",
  INVALID_FORM_PAYLOAD: "INVALID_FORM_PAYLOAD",
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
} as const;

export type FormErrorCode =
  (typeof FORM_ERROR_CODES)[keyof typeof FORM_ERROR_CODES];

export class FormServiceError extends Error {
  readonly code: FormErrorCode;
  readonly status: number;

  constructor(code: FormErrorCode, message: string, status = 400) {
    super(message);
    this.name = "FormServiceError";
    this.code = code;
    this.status = status;
  }
}

function normalizeSlug(value: string, fieldName: string) {
  const normalized = value.trim();

  if (!normalized) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      `${fieldName} es requerido.`,
      400,
    );
  }

  return normalized;
}

function validateAnswers(answers: FormAnswers) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new FormServiceError(
      FORM_ERROR_CODES.INVALID_FORM_PAYLOAD,
      "Las respuestas del formulario deben ser un objeto JSON.",
      400,
    );
  }

  return answers;
}

async function resolveSubmissionScope(
  input: {
    formSlug: string;
    productSlug: string;
    profileId: string;
  },
  supabase: SupabaseClient<Database>,
) {
  const product = await ProductRepository.getBySlug(supabase, input.productSlug);

  if (!product || product.status !== "active") {
    throw new FormServiceError(
      FORM_ERROR_CODES.PRODUCT_NOT_FOUND,
      "No encontramos el producto asociado al formulario.",
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
    throw new FormServiceError(
      FORM_ERROR_CODES.ACTIVE_ENROLLMENT_REQUIRED,
      "Necesitas un enrollment activo para responder este formulario.",
      403,
    );
  }

  const formDefinition = await FormRepository.getPublishedDefinitionBySlug(
    {
      productId: product.id,
      slug: input.formSlug,
    },
    supabase,
  );

  if (!formDefinition) {
    throw new FormServiceError(
      FORM_ERROR_CODES.FORM_NOT_FOUND,
      "No encontramos un formulario publicado con ese identificador.",
      404,
    );
  }

  return {
    enrollment: access.enrollment,
    formDefinition,
    product,
  };
}

export const FormService = {
  async listPublishedDefinitions(
    productId: string,
    supabase?: SupabaseClient<Database>,
  ): Promise<FormDefinition[]> {
    return FormRepository.listPublishedDefinitionsByProduct(productId, supabase);
  },

  async getRequiredFormsProgress(
    input: {
      enrollmentId: string | null;
      productId: string;
      profileId: string;
    },
    supabase?: SupabaseClient<Database>,
  ): Promise<RequiredFormsProgress> {
    if (!input.enrollmentId) {
      return {
        requiredForms: 0,
        submittedRequiredForms: 0,
      };
    }

    return FormRepository.listRequiredFormsProgress(
      {
        enrollmentId: input.enrollmentId,
        productId: input.productId,
        profileId: input.profileId,
      },
      supabase,
    );
  },

  async submitForm(
    input: FormSubmissionInput & {
      profileId: string;
    },
    supabase: SupabaseClient<Database>,
  ): Promise<FormSubmission> {
    const productSlug = normalizeSlug(input.productSlug, "productSlug");
    const formSlug = normalizeSlug(input.formSlug, "formSlug");
    const answers = validateAnswers(input.answers);
    const scope = await resolveSubmissionScope(
      {
        formSlug,
        productSlug,
        profileId: input.profileId,
      },
      supabase,
    );

    return FormRepository.upsertSubmission(
      {
        enrollmentId: scope.enrollment.id,
        formDefinitionId: scope.formDefinition.id,
        productId: scope.product.id,
        profileId: input.profileId,
      },
      answers,
      supabase,
    );
  },
};
