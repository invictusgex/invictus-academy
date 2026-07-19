type ProgressBarProps = {
  value: number;
  label: string;
};

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </span>
        <span className="text-sm font-semibold text-white">{value} %</span>
      </div>
      <div
        aria-label={`${label}: ${value} %`}
        className="h-3 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-page-bg)]"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[var(--color-cyan)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
