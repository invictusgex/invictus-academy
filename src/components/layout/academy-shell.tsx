import { AcademyHeader } from "@/components/layout/academy-header";
import { AcademySidebar } from "@/components/layout/academy-sidebar";
import { PublicBackgroundField } from "@/components/public/PublicBackgroundField";
import { PublicSiteMotion } from "@/components/public/PublicSiteMotion";
import { AcademySupport } from "@/components/support/AcademySupport";
import { academyNavigation } from "@/lib/academy";

type AcademyShellProps = {
  children: React.ReactNode;
};

export function AcademyShell({ children }: AcademyShellProps) {
  return (
    <div className="public-site app-shell-surface relative min-h-screen overflow-x-hidden bg-[var(--color-page-bg)] text-[var(--color-text-primary)] lg:flex">
      <PublicSiteMotion />
      <PublicBackgroundField />
      <AcademySidebar navigation={academyNavigation} />

      <div className="relative z-10 min-w-0 flex-1">
        <AcademyHeader />
        <main className="mx-auto w-full max-w-6xl px-5 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8 sm:pb-28 lg:px-8 lg:pb-24">
          {children}
        </main>
      </div>

      <AcademySupport />
    </div>
  );
}
