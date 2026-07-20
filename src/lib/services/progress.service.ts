import { ProgressRepository } from "@/lib/repositories/progress.repository";
import type {
  ModuleProgress,
  ModuleProgressRow,
  ModuleProgressStatus,
  ModuleProgressUpsertInput,
  ProgressSyncResult,
} from "@/lib/types/progress.types";
import type {
  AcademyProgressState,
  Course,
  Module,
  VideoProgressStatus,
} from "@/types/academy";
import { getModuleProgressSummary } from "@/utils/module-progress";
import {
  createEmptyAcademyProgress,
  getAcademyProgressVideoStatus,
  updateAcademyProgressVideoStatus,
} from "@/lib/services/progress-cache.service";

type SyncProgressInput = {
  course: Course;
  localProgress: AcademyProgressState;
  productSlug: string;
  profileId: string;
  programId: string;
};

type LocalModuleProgress = {
  completedAt: string | null;
  lastSeenAt: string | null;
  moduleKey: string;
  progressPercent: number;
  startedAt: string | null;
  status: ModuleProgressStatus;
};

function clampProgressPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getStatusFromProgressPercent(
  progressPercent: number,
): ModuleProgressStatus {
  const normalizedPercent = clampProgressPercent(progressPercent);

  if (normalizedPercent === 100) {
    return "completed";
  }

  if (normalizedPercent > 0) {
    return "in_progress";
  }

  return "not_started";
}

function getEarlierDate(first: string | null, second: string | null) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return new Date(first).getTime() <= new Date(second).getTime()
    ? first
    : second;
}

function getLaterDate(first: string | null, second: string | null) {
  if (!first) {
    return second;
  }

  if (!second) {
    return first;
  }

  return new Date(first).getTime() >= new Date(second).getTime()
    ? first
    : second;
}

function getModuleVideoStatus(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
) {
  return (
    progress.programs[programId]?.modules[moduleId]?.videos[videoId]?.status ??
    "not-started"
  );
}

function getProgressUpdatedAt(moduleProgress: ModuleProgress) {
  return (
    moduleProgress.completedAt ??
    moduleProgress.lastSeenAt ??
    moduleProgress.updatedAt
  );
}

function getCompletedSessionCountFromPercent(
  academyModule: Module,
  progressPercent: number,
) {
  const normalizedPercent = clampProgressPercent(progressPercent);

  if (normalizedPercent === 100) {
    return academyModule.videos.length;
  }

  return Math.floor((normalizedPercent / 100) * academyModule.videos.length);
}

function getModuleVideoUpdatedAt(
  progress: AcademyProgressState,
  programId: string,
  moduleId: string,
  videoId: string,
) {
  return (
    progress.programs[programId]?.modules[moduleId]?.videos[videoId]
      ?.updatedAt ?? null
  );
}

function getLocalModuleDates(
  academyModule: Module,
  localProgress: AcademyProgressState,
  programId: string,
) {
  let startedAt: string | null = null;
  let completedAt: string | null = null;
  let lastSeenAt: string | null = null;

  for (const video of academyModule.videos) {
    const status = getModuleVideoStatus(
      localProgress,
      programId,
      academyModule.id,
      video.id,
    );
    const updatedAt = getModuleVideoUpdatedAt(
      localProgress,
      programId,
      academyModule.id,
      video.id,
    );

    if (!updatedAt || status === "not-started") {
      continue;
    }

    startedAt = getEarlierDate(startedAt, updatedAt);
    lastSeenAt = getLaterDate(lastSeenAt, updatedAt);

    if (status === "completed") {
      completedAt = getLaterDate(completedAt, updatedAt);
    }
  }

  return { completedAt, lastSeenAt, startedAt };
}

function getLocalModuleProgress(
  course: Course,
  localProgress: AcademyProgressState,
  programId: string,
): LocalModuleProgress[] {
  return course.modules
    .map((academyModule) => {
      const summary = getModuleProgressSummary(academyModule, (moduleId, videoId) =>
        getModuleVideoStatus(localProgress, programId, moduleId, videoId),
      );
      const progressPercent = clampProgressPercent(summary.percentage);
      const status = getStatusFromProgressPercent(progressPercent);
      const dates = getLocalModuleDates(academyModule, localProgress, programId);

      return {
        completedAt: status === "completed" ? dates.completedAt : null,
        lastSeenAt: dates.lastSeenAt,
        moduleKey: academyModule.id,
        progressPercent,
        startedAt: dates.startedAt,
        status,
      };
    })
    .filter(
      (moduleProgress) =>
        moduleProgress.status !== "not_started" ||
        moduleProgress.progressPercent > 0,
    );
}

export function mapModuleProgressRow(row: ModuleProgressRow): ModuleProgress {
  const progressPercent = clampProgressPercent(row.progress_percent);
  const status = getStatusFromProgressPercent(progressPercent);

  return {
    completedAt: status === "completed" ? row.completed_at : null,
    createdAt: row.created_at,
    id: row.id,
    lastSeenAt: row.last_seen_at,
    moduleKey: row.module_key,
    productId: row.product_id,
    profileId: row.profile_id,
    progressPercent,
    startedAt: row.started_at,
    status,
    updatedAt: row.updated_at,
  };
}

function mergeModuleProgress({
  local,
  now,
  productId,
  profileId,
  remote,
}: {
  local: LocalModuleProgress | undefined;
  now: string;
  productId: string;
  profileId: string;
  remote: ModuleProgress | undefined;
}): ModuleProgressUpsertInput | null {
  const localPercent = local?.progressPercent ?? 0;
  const remotePercent = remote?.progressPercent ?? 0;
  const progressPercent = clampProgressPercent(
    Math.max(localPercent, remotePercent),
  );
  const status = getStatusFromProgressPercent(progressPercent);

  if (status === "not_started" && progressPercent === 0 && !remote) {
    return null;
  }

  const completedAt =
    remote?.completedAt ??
    (status === "completed" ? local?.completedAt ?? now : null);

  return {
    completedAt,
    lastSeenAt: now,
    moduleKey: local?.moduleKey ?? remote?.moduleKey ?? "",
    productId,
    profileId,
    progressPercent,
    startedAt:
      remote?.startedAt ??
      local?.startedAt ??
      (status === "not_started" ? null : now),
    status,
  };
}

function isSameRemoteProgress(
  merged: ModuleProgressUpsertInput,
  remote: ModuleProgress | undefined,
) {
  if (!remote) {
    return false;
  }

  return (
    remote.completedAt === merged.completedAt &&
    remote.moduleKey === merged.moduleKey &&
    remote.productId === merged.productId &&
    remote.profileId === merged.profileId &&
    remote.progressPercent === merged.progressPercent &&
    remote.startedAt === merged.startedAt &&
    remote.status === merged.status
  );
}

export function moduleProgressToAcademyProgressCache({
  course,
  moduleProgress,
  programId,
  seedProgress = createEmptyAcademyProgress(),
}: {
  course: Course;
  moduleProgress: ModuleProgress[];
  programId: string;
  seedProgress?: AcademyProgressState;
}) {
  let nextProgress = seedProgress;

  for (const moduleRecord of moduleProgress) {
    const academyModule = course.modules.find(
      (module) => module.id === moduleRecord.moduleKey,
    );

    if (!academyModule) {
      continue;
    }

    const completedSessionCount = getCompletedSessionCountFromPercent(
      academyModule,
      moduleRecord.progressPercent,
    );
    const updatedAt = getProgressUpdatedAt(moduleRecord);

    academyModule.videos.forEach((video, index) => {
      const currentStatus = getAcademyProgressVideoStatus(
        nextProgress,
        programId,
        academyModule.id,
        video.id,
      );
      let nextStatus: VideoProgressStatus = "not-started";

      if (index < completedSessionCount) {
        nextStatus = "completed";
      } else if (
        index === completedSessionCount &&
        moduleRecord.status === "in_progress"
      ) {
        nextStatus = "in-progress";
      }

      if (
        currentStatus === "completed" ||
        currentStatus === nextStatus ||
        nextStatus === "not-started" ||
        !updatedAt
      ) {
        return;
      }

      nextProgress = updateAcademyProgressVideoStatus(
        nextProgress,
        programId,
        academyModule.id,
        video.id,
        nextStatus,
        updatedAt,
      );
    });
  }

  return nextProgress;
}

export async function syncModuleProgress({
  course,
  localProgress,
  productSlug,
  profileId,
  programId,
}: SyncProgressInput): Promise<ProgressSyncResult> {
  const product = await ProgressRepository.getProductBySlug(productSlug);

  if (!product) {
    throw new Error("Progress product was not found.");
  }

  const remoteBefore = (
    await ProgressRepository.listByProfileAndProduct(profileId, product.id)
  ).map(mapModuleProgressRow);
  const localModules = getLocalModuleProgress(course, localProgress, programId);
  const localByModule = new Map(
    localModules.map((moduleProgress) => [
      moduleProgress.moduleKey,
      moduleProgress,
    ]),
  );
  const remoteByModule = new Map(
    remoteBefore.map((moduleProgress) => [
      moduleProgress.moduleKey,
      moduleProgress,
    ]),
  );
  const moduleKeys = new Set([
    ...localByModule.keys(),
    ...remoteByModule.keys(),
  ]);
  const now = new Date().toISOString();
  const merged = Array.from(moduleKeys)
    .map((moduleKey) =>
      mergeModuleProgress({
        local: localByModule.get(moduleKey),
        now,
        productId: product.id,
        profileId,
        remote: remoteByModule.get(moduleKey),
      }),
    )
    .filter(
      (moduleProgress): moduleProgress is ModuleProgressUpsertInput =>
        moduleProgress !== null && moduleProgress.moduleKey.length > 0,
    );
  const syncedRows = [];

  for (const moduleProgress of merged) {
    const remote = remoteByModule.get(moduleProgress.moduleKey);

    if (isSameRemoteProgress(moduleProgress, remote)) {
      continue;
    }

    syncedRows.push(await ProgressRepository.upsertModuleProgress(moduleProgress));
  }

  const syncedByModule = new Map(
    remoteBefore
      .filter((remote) =>
        merged.some(
          (moduleProgress) => moduleProgress.moduleKey === remote.moduleKey,
        ),
      )
      .map((remote) => [remote.moduleKey, remote]),
  );

  for (const syncedRow of syncedRows.map(mapModuleProgressRow)) {
    syncedByModule.set(syncedRow.moduleKey, syncedRow);
  }

  return {
    merged,
    productId: product.id,
    remoteBefore,
    synced: Array.from(syncedByModule.values()),
  };
}
