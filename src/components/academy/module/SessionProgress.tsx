import { ProgressBar } from "@/components/ui/progress-bar";

type SessionProgressProps = {
  completedSessions: number;
  totalSessions: number;
};

export function SessionProgress({
  completedSessions,
  totalSessions,
}: SessionProgressProps) {
  const progressValue =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  return (
    <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-4 sm:p-5">
      <ProgressBar
        label={`${completedSessions} de ${totalSessions} sesiones completadas`}
        value={progressValue}
      />
    </div>
  );
}
