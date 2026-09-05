"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const tiktokProfileUrl =
  "https://www.tiktok.com/@in_victus_gex?is_from_webapp=1&sender_device=pc";
const discordInviteUrl = "https://discord.gg/VRQKuQpj8";

type AcademyAccessCheck = {
  hasAcademyAccess: boolean;
  userId: string;
};

let cachedAccessCheck: AcademyAccessCheck | null = null;
let pendingAccessCheck: Promise<AcademyAccessCheck> | null = null;

function TikTokMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M14.7 3.5v9.84a4.9 4.9 0 1 1-4.9-4.9c.36 0 .72.04 1.06.12v3.05a2.04 2.04 0 1 0 1.62 1.99V3.5h2.22Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.7 3.5c.58 2.34 2.24 3.94 4.65 4.37v2.94c-1.83-.1-3.42-.72-4.65-1.81"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function DiscordMark() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M8.25 8.7c2.25-.72 5.25-.72 7.5 0M8.8 17.25c-1.35-.18-2.64-.58-3.72-1.2-.42-2.86.18-5.74 1.75-8.3a10.9 10.9 0 0 1 3.24-1.2l.56 1.04M15.2 17.25c1.35-.18 2.64-.58 3.72-1.2.42-2.86-.18-5.74-1.75-8.3a10.9 10.9 0 0 0-3.24-1.2l-.56 1.04M9.15 14.45c.65.46 1.57.82 2.85.82s2.2-.36 2.85-.82"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.4 12.15h.02M14.58 12.15h.02"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

type PublicSocialButtonProps = {
  "aria-label": string;
  href: string;
  icon: ReactNode;
  label: string;
};

function PublicSocialButton({
  "aria-label": ariaLabel,
  href,
  icon,
  label,
}: PublicSocialButtonProps) {
  return (
    <a
      aria-label={ariaLabel}
      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[var(--color-cyan)]/35 bg-[var(--color-cyan)]/10 px-3 text-xs font-semibold tracking-[0.08em] text-[var(--color-cyan)] uppercase shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/16 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

export function PublicTikTokLink() {
  const { initialized, user } = useAuth();
  const [accessCheck, setAccessCheck] = useState<AcademyAccessCheck | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    if (!initialized || !user) {
      return () => {
        isMounted = false;
      };
    }

    if (cachedAccessCheck?.userId === user.id) {
      Promise.resolve(cachedAccessCheck).then((result) => {
        if (isMounted) {
          setAccessCheck(result);
        }
      });

      return () => {
        isMounted = false;
      };
    }

    pendingAccessCheck ??= fetch("/api/academy/access", {
      cache: "no-store",
      credentials: "same-origin",
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error("No se pudo verificar el acceso.");
      }

      const payload = (await response.json()) as {
        hasAcademyProgramAccess?: boolean;
      };

      return {
        hasAcademyAccess: payload.hasAcademyProgramAccess === true,
        userId: user.id,
      };
    });

    pendingAccessCheck
      .then((result) => {
        cachedAccessCheck = result;

        if (isMounted) {
          setAccessCheck(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAccessCheck(null);
        }
      })
      .finally(() => {
        pendingAccessCheck = null;
      });

    return () => {
      isMounted = false;
    };
  }, [initialized, user]);

  const hasCurrentUserAcademyAccess =
    user && accessCheck?.userId === user.id
      ? accessCheck.hasAcademyAccess
      : null;
  const shouldShow =
    initialized && (!user || hasCurrentUserAcademyAccess === false);

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <PublicSocialButton
        aria-label="Abrir perfil de TikTok de Invictus GEX"
        href={tiktokProfileUrl}
        icon={<TikTokMark />}
        label="TikTok"
      />
      <PublicSocialButton
        aria-label="Abrir canal de Discord de Invictus GEX"
        href={discordInviteUrl}
        icon={<DiscordMark />}
        label="Discord"
      />
    </div>
  );
}
