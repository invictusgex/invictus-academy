"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";

const promoMessage =
  "Cupón de descuento de 350 USD para acceder a la academia";

export function PublicPromoRibbon() {
  const { initialized, user } = useAuth();
  const [accessCheck, setAccessCheck] = useState<{
    hasAcademyAccess: boolean;
    userId: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!initialized) {
      return () => {
        isMounted = false;
      };
    }

    if (!user) {
      return () => {
        isMounted = false;
      };
    }

    fetch("/api/academy/access", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No se pudo verificar el acceso.");
        }

        return (await response.json()) as {
          hasAcademyProgramAccess?: boolean;
        };
      })
      .then((payload) => {
        if (isMounted) {
          setAccessCheck({
            hasAcademyAccess: payload.hasAcademyProgramAccess === true,
            userId: user.id,
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setAccessCheck(null);
        }
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

  useEffect(() => {
    document.body.classList.toggle("promo-ribbon-active", shouldShow);

    return () => {
      document.body.classList.remove("promo-ribbon-active");
    };
  }, [shouldShow]);

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <aside className="public-promo-ribbon" aria-label="Promoción vigente">
        <div className="public-promo-ribbon-track">
          {Array.from({ length: 4 }, (_, index) => (
            <span className="public-promo-ribbon-message" key={index}>
              {promoMessage}
            </span>
          ))}
        </div>
      </aside>
      <div className="public-promo-ribbon-spacer" aria-hidden="true" />
    </>
  );
}
