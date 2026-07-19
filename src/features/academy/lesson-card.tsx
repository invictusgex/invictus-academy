import Link from "next/link";

import type { AcademyLesson } from "@/types/academy";

type LessonCardProps = {
  lesson: AcademyLesson;
  moduleId: string;
};

export function LessonCard({ lesson, moduleId }: LessonCardProps) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-cyan)] uppercase">
        Clase {lesson.lessonNumber}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-white">{lesson.title}</h3>
      <Link
        href={`/academy/programa/${moduleId}/${lesson.id}`}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] px-5 text-sm font-semibold text-white transition hover:border-[var(--color-cyan)] hover:bg-[var(--color-hover-bg)]"
      >
        Abrir clase
      </Link>
    </article>
  );
}
