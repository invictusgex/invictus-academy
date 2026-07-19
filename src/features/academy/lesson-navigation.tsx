import Link from "next/link";

import type { AcademyLesson, AcademyModule } from "@/types/academy";
import { classNames } from "@/utils/class-names";

type LessonNavigationProps = {
  lessons: AcademyLesson[];
  academyModule: AcademyModule;
  currentLessonId: string;
};

export function LessonNavigation({
  lessons,
  academyModule,
  currentLessonId,
}: LessonNavigationProps) {
  return (
    <aside className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-5 lg:sticky lg:top-6">
      <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-5">
        <h2 className="text-lg font-semibold text-white">Clases del módulo</h2>
        <Link
          href={`/academy/programa/${academyModule.id}`}
          className="text-sm font-medium text-[var(--color-cyan)] transition hover:text-[var(--color-cyan-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]"
        >
          Volver al módulo
        </Link>
      </div>

      <nav aria-label="Clases del módulo" className="mt-5 grid gap-2">
        {lessons.map((lesson) => {
          const isCurrent = lesson.id === currentLessonId;

          return (
            <Link
              key={lesson.id}
              href={`/academy/programa/${academyModule.id}/${lesson.id}`}
              aria-current={isCurrent ? "page" : undefined}
              className={classNames(
                "flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-cyan)]",
                isCurrent
                  ? "border-[var(--color-cyan)] bg-[rgba(34,211,238,0.08)] text-white"
                  : "border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-hover-bg)] hover:text-white",
              )}
            >
              <span>{lesson.title}</span>
              {isCurrent ? (
                <span className="rounded-full border border-[var(--color-cyan)] px-2 py-0.5 text-xs text-[var(--color-cyan)]">
                  Actual
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
