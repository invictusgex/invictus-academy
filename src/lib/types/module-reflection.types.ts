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
  attachments?: ModuleReflectionAttachment[];
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

export type ModuleReflectionAttachmentRow = {
  created_at: string;
  enrollment_id: string;
  id: string;
  mime_type: string;
  module_key: string;
  original_name: string;
  product_id: string;
  profile_id: string;
  reflection_id: string;
  size_bytes: number;
  storage_path: string;
};

export type ModuleReflectionAttachment = {
  createdAt: string;
  enrollmentId: string;
  id: string;
  mimeType: string;
  moduleKey: string;
  originalName: string;
  productId: string;
  profileId: string;
  reflectionId: string;
  signedUrl: string | null;
  sizeBytes: number;
  storagePath: string;
};

export type ModuleReflectionAttachmentInput = ModuleReflectionScope & {
  file: File;
  reflectionId: string;
};
