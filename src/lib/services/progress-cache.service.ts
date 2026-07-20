import type { AcademyProgressState, VideoProgressStatus } from "@/types/academy";

export const ACADEMY_PROGRESS_STORAGE_KEY = "invictus-academy-progress-v1";
export const ACADEMY_PROGRESS_UPDATED_EVENT =
  "invictus-academy-progress-updated";

const progressListeners = new Set<() => void>();
const emptyProgressSnapshot = createEmptyAcademyProgress();
let cachedStoredValue: string | null = null;
let cachedProgress = emptyProgressSnapshot;

export function createEmptyAcademyProgress(): AcademyProgressState {
  return {
    version: 1,
    programs: {},
  };
}

function isAcademyProgressState(value: unknown): value is AcademyProgressState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AcademyProgressState>;

  return candidate.version === 1 && typeof candidate.programs === "object";
}

export function readAcademyProgressSnapshot() {
  if (typeof window === "undefined") {
    return createEmptyAcademyProgress();
  }

  try {
    const storedValue = window.localStorage.getItem(ACADEMY_PROGRESS_STORAGE_KEY);

    if (storedValue === cachedStoredValue) {
      return cachedProgress;
    }

    if (!storedValue) {
      cachedStoredValue = storedValue;
      cachedProgress = createEmptyAcademyProgress();

      return cachedProgress;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    cachedStoredValue = storedValue;
    cachedProgress = isAcademyProgressState(parsedValue)
      ? parsedValue
      : createEmptyAcademyProgress();

    return cachedProgress;
  } catch {
    cachedStoredValue = null;
    cachedProgress = createEmptyAcademyProgress();

    return cachedProgress;
  }
}

export function writeAcademyProgressSnapshot(progress: AcademyProgressState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const nextStoredValue = JSON.stringify(progress);

    window.localStorage.setItem(ACADEMY_PROGRESS_STORAGE_KEY, nextStoredValue);
    cachedStoredValue = nextStoredValue;
    cachedProgress = progress;
    progressListeners.forEach((listener) => listener());
    window.dispatchEvent(new Event(ACADEMY_PROGRESS_UPDATED_EVENT));
  } catch {
    // La cache local no debe impedir que la experiencia privada siga usable.
  }
}

export function subscribeToAcademyProgress(listener: () => void) {
  progressListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACADEMY_PROGRESS_STORAGE_KEY) {
      cachedStoredValue = null;
      progressListeners.forEach((currentListener) => currentListener());
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    progressListeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

export function getEmptyProgressSnapshot() {
  return emptyProgressSnapshot;
}

export function getAcademyProgressVideoStatus(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
): VideoProgressStatus {
  return (
    progress.programs[programId]?.modules[moduleId]?.videos[videoId]?.status ??
    "not-started"
  );
}

export function updateAcademyProgressVideoStatus(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
  status: VideoProgressStatus,
  updatedAt = new Date().toISOString(),
) {
  const currentStatus = getAcademyProgressVideoStatus(
    progress,
    programId,
    moduleId,
    videoId,
  );

  if (currentStatus === status) {
    return progress;
  }

  return {
    ...progress,
    programs: {
      ...progress.programs,
      [programId]: {
        modules: {
          ...(progress.programs[programId]?.modules ?? {}),
          [moduleId]: {
            videos: {
              ...(progress.programs[programId]?.modules[moduleId]?.videos ?? {}),
              [videoId]: {
                status,
                updatedAt,
              },
            },
          },
        },
      },
    },
  };
}
