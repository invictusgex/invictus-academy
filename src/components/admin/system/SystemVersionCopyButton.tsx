"use client";

import { useState } from "react";

type SystemVersionCopyButtonProps = {
  value: string;
};

export function SystemVersionCopyButton({ value }: SystemVersionCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Versión copiada" : "Copiar versión"}
    </button>
  );
}
