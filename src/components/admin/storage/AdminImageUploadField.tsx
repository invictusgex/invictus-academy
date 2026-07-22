"use client";

import { useMemo } from "react";

import { AdminFileUploadField } from "@/components/admin/storage/AdminFileUploadField";
import type { AcademyAssetKind } from "@/lib/types/storage.types";

type AdminImageUploadFieldProps = {
  disabled?: boolean;
  helpText: string;
  kind: Extract<AcademyAssetKind, "module_thumbnail" | "scenario_thumbnail">;
  label: string;
  onChange: (path: string) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
  value: string;
};

export function AdminImageUploadField({
  disabled,
  helpText,
  kind,
  label,
  onChange,
  onUploadStateChange,
  value,
}: AdminImageUploadFieldProps) {
  const allowedKinds = useMemo(() => [kind], [kind]);

  return (
    <AdminFileUploadField
      accept="image/jpeg,image/png,image/webp"
      allowedKinds={allowedKinds}
      disabled={disabled}
      helpText={helpText}
      label={label}
      mode="image"
      onChange={onChange}
      onUploadStateChange={onUploadStateChange}
      resolveKind={() => kind}
      value={value}
    />
  );
}
