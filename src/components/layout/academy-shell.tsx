import { AcademyHeader } from "@/components/layout/academy-header";
import { AcademySidebar } from "@/components/layout/academy-sidebar";
import { academyNavigation } from "@/lib/academy-content";

type AcademyShellProps = {
  children: React.ReactNode;
};

export function AcademyShell({ children }: AcademyShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-text-primary)] lg:flex">
      <AcademySidebar navigation={academyNavigation} />

      <div className="min-w-0 flex-1">
        <AcademyHeader />
        <main className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
