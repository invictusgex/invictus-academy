"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

const SUPPORT_PANEL_ID = "academy-support-panel";
const SUPPORT_TITLE_ID = "academy-support-title";
const SUPPORT_SUBJECT = "Soporte Invictus Trading Academy";

export function AcademySupport() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  const supportHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`
    : undefined;

  const closePanel = useCallback(() => {
    setIsOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      (contactRef.current ?? closeRef.current)?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePanel, isOpen]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }

    const focusableElements = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <>
      {isOpen ? (
        <div
          id={SUPPORT_PANEL_ID}
          ref={panelRef}
          role="dialog"
          aria-labelledby={SUPPORT_TITLE_ID}
          onKeyDown={handlePanelKeyDown}
          className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 shadow-2xl shadow-black/40 transition sm:right-6 sm:bottom-24"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
            Soporte Invictus
          </p>
          <h2 id={SUPPORT_TITLE_ID} className="mt-3 text-xl font-semibold text-white">
            ¿Necesitas asistencia?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Recibe ayuda con el acceso, el Programa de Formación o el
            funcionamiento de la plataforma.
          </p>

          {supportHref ? (
            <a
              ref={contactRef}
              href={supportHref}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--color-cyan)] px-5 text-sm font-semibold text-[var(--color-page-bg)] transition hover:bg-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
            >
              Contactar con soporte
            </a>
          ) : (
            <p className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              El canal de soporte aún no ha sido configurado.
            </p>
          )}

          <button
            ref={closeRef}
            type="button"
            onClick={closePanel}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
          >
            Cerrar
          </button>
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-label="Contactar con soporte"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={SUPPORT_PANEL_ID}
        onClick={() => setIsOpen((currentState) => !currentState)}
        className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-cyan-line)] bg-[var(--color-card-bg)] px-4 text-sm font-semibold text-white shadow-xl shadow-black/30 transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)] sm:right-6 sm:bottom-6"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4.75 6.75A3 3 0 0 1 7.75 3.75h8.5a3 3 0 0 1 3 3v5.5a3 3 0 0 1-3 3H11l-4.75 4v-4h-1.5a3 3 0 0 1-3-3v-5.5Z" />
        </svg>
        <span>Soporte</span>
      </button>
    </>
  );
}
