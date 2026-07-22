import type { ReactNode } from "react";

import { classNames } from "@/utils/class-names";

type StudentContentGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
};

export function StudentContentGrid({
  children,
  columns = 3,
}: StudentContentGridProps) {
  return (
    <div
      className={classNames(
        "grid gap-4",
        columns === 2 && "lg:grid-cols-2",
        columns === 3 && "md:grid-cols-2 xl:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}
