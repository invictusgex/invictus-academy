"use client";

import { AdminFileUploadField } from "@/components/admin/storage/AdminFileUploadField";
import { StorageService } from "@/lib/services/storage.service";
import type { AcademyAssetKind } from "@/lib/types/storage.types";

type AdminDocumentUploadFieldProps = {
  allowedKinds: AcademyAssetKind[];
  disabled?: boolean;
  helpText: string;
  label: string;
  onChange: (path: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  value: string;
};

export function AdminDocumentUploadField({
  allowedKinds,
  disabled,
  helpText,
  label,
  onChange,
  onUploadStateChange,
  value,
}: AdminDocumentUploadFieldProps) {
  const maxSize = Math.max(
    ...allowedKinds.map(
      (kind) => StorageService.getValidationRule(kind).maxSizeBytes,
    ),
  );

  return (
    <AdminFileUploadField
      accept=".pdf,.doc,.docx,image/jpeg,image/png,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      allowedKinds={allowedKinds}
      disabled={disabled}
      helpText={`${helpText} Tamano maximo: ${StorageService.formatFileSize(maxSize)}.`}
      label={label}
      mode="document"
      onChange={onChange}
      onUploadStateChange={onUploadStateChange}
      resolveKind={(file) => StorageService.determineAssetKindFromFile(file, file.name)}
      value={value}
    />
  );
}
