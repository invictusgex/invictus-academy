export type ModuleReflectionRow = {
  content: string;
  created_at: string;
  enrollment_id: string;
  id: string;
  module_key: string;
  product_id: string;
  profile_id: string;
  updated_at: string;
};

export type ModuleReflection = {
  content: string;
  createdAt: string;
  enrollmentId: string;
  id: string;
  moduleKey: string;
  productId: string;
  profileId: string;
  updatedAt: string;
};

export type ModuleReflectionScope = {
  enrollmentId: string;
  moduleKey: string;
  productId: string;
  profileId: string;
};

export type ModuleReflectionUpsertInput = ModuleReflectionScope & {
  content: string;
};
