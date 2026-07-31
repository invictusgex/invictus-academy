import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/database/client";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  FormAnswers,
  FormDefinition,
  FormDefinitionStatus,
  FormSchema,
  FormSubmission,
  RequiredFormsProgress,
} from "@/lib/types/form.types";

type FormDefinitionRow =
  Database["public"]["Tables"]["academy_form_definitions"]["Row"];

type FormSubmissionRow =
  Database["public"]["Tables"]["academy_form_submissions"]["Row"];

type FormSubmissionScope = {
  enrollmentId: string;
  formDefinitionId: string;
  productId: string;
  profileId: string;
};

const formDefinitionSelect = `
  id,
  product_id,
  slug,
  title,
  description,
  status,
  is_required,
  form_schema,
  display_order,
  published_at,
  created_at,
  updated_at
`;

const formSubmissionSelect = `
  id,
  form_definition_id,
  profile_id,
  enrollment_id,
  product_id,
  answers,
  submitted_at,
  created_at,
  updated_at
`;

function mapFormDefinitionStatus(status: string): FormDefinitionStatus {
  if (status === "draft" || status === "published" || status === "archived") {
    return status;
  }

  throw new Error(`Unexpected form definition status: ${status}.`);
}

function mapFormSchema(value: Json): FormSchema {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { fields: [] };
  }

  const schema = value as Record<string, Json | undefined>;
  const fields = Array.isArray(schema.fields) ? schema.fields : [];

  return {
    ...schema,
    fields,
  };
}

function mapFormAnswers(value: Json): FormAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as FormAnswers;
}

function mapFormDefinition(row: FormDefinitionRow): FormDefinition {
  return {
    id: row.id,
    productId: row.product_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: mapFormDefinitionStatus(row.status),
    isRequired: row.is_required,
    formSchema: mapFormSchema(row.form_schema),
    displayOrder: row.display_order,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapFormSubmission(row: FormSubmissionRow): FormSubmission {
  return {
    id: row.id,
    formDefinitionId: row.form_definition_id,
    profileId: row.profile_id,
    enrollmentId: row.enrollment_id,
    productId: row.product_id,
    answers: mapFormAnswers(row.answers),
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const FormRepository = {
  async getPublishedDefinitionBySlug(
    input: {
      productId: string;
      slug: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<FormDefinition | null> {
    const { data, error } = await supabase
      .from("academy_form_definitions")
      .select(formDefinitionSelect)
      .eq("product_id", input.productId)
      .eq("slug", input.slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapFormDefinition(data) : null;
  },

  async listPublishedDefinitionsByProduct(
    productId: string,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<FormDefinition[]> {
    const { data, error } = await supabase
      .from("academy_form_definitions")
      .select(formDefinitionSelect)
      .eq("product_id", productId)
      .eq("status", "published")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return ((data as FormDefinitionRow[] | null) ?? []).map(mapFormDefinition);
  },

  async listRequiredFormsProgress(
    input: {
      enrollmentId: string;
      productId: string;
      profileId: string;
    },
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<RequiredFormsProgress> {
    const requiredDefinitions = await FormRepository.listPublishedDefinitionsByProduct(
      input.productId,
      supabase,
    );
    const requiredDefinitionIds = requiredDefinitions
      .filter((definition) => definition.isRequired)
      .map((definition) => definition.id);

    if (requiredDefinitionIds.length === 0) {
      return {
        requiredForms: 0,
        submittedRequiredForms: 0,
      };
    }

    const { data, error } = await supabase
      .from("academy_form_submissions")
      .select("form_definition_id")
      .eq("profile_id", input.profileId)
      .eq("product_id", input.productId)
      .eq("enrollment_id", input.enrollmentId)
      .in("form_definition_id", requiredDefinitionIds);

    if (error) {
      throw error;
    }

    const submittedIds = new Set(
      ((data as Pick<FormSubmissionRow, "form_definition_id">[] | null) ?? [])
        .map((submission) => submission.form_definition_id),
    );

    return {
      requiredForms: requiredDefinitionIds.length,
      submittedRequiredForms: submittedIds.size,
    };
  },

  async upsertSubmission(
    scope: FormSubmissionScope,
    answers: FormAnswers,
    supabase: SupabaseClient<Database> = getSupabaseClient(),
  ): Promise<FormSubmission> {
    const { data, error } = await supabase
      .from("academy_form_submissions")
      .upsert(
        {
          answers,
          enrollment_id: scope.enrollmentId,
          form_definition_id: scope.formDefinitionId,
          product_id: scope.productId,
          profile_id: scope.profileId,
          submitted_at: new Date().toISOString(),
        },
        {
          onConflict: "form_definition_id,profile_id,enrollment_id",
        },
      )
      .select(formSubmissionSelect)
      .single();

    if (error) {
      throw error;
    }

    return mapFormSubmission(data);
  },
};
