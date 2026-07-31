import type { Json } from "@/lib/supabase/database.types";

export const formDefinitionStatuses = ["draft", "published", "archived"] as const;

export type FormDefinitionStatus = (typeof formDefinitionStatuses)[number];

export type FormSchema = {
  fields: Json[];
  [key: string]: Json | undefined;
};

export type FormAnswers = Record<string, Json>;

export type FormDefinition = {
  id: string;
  productId: string;
  slug: string;
  title: string;
  description: string;
  status: FormDefinitionStatus;
  isRequired: boolean;
  formSchema: FormSchema;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FormSubmission = {
  id: string;
  formDefinitionId: string;
  profileId: string;
  enrollmentId: string;
  productId: string;
  answers: FormAnswers;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FormSubmissionInput = {
  formSlug: string;
  productSlug: string;
  answers: FormAnswers;
};

export type RequiredFormsProgress = {
  requiredForms: number;
  submittedRequiredForms: number;
};
