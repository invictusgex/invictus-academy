export type ModuleProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export interface ModuleProgress {
  id: string;
  profileId: string;
  productId: string;
  moduleKey: string;
  status: ModuleProgressStatus;
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ModuleProgressRow = {
  id: string;
  profile_id: string;
  product_id: string;
  module_key: string;
  status: ModuleProgressStatus;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductReference = {
  id: string;
  slug: string;
};

export type ModuleProgressUpsertInput = {
  profileId: string;
  productId: string;
  moduleKey: string;
  status: ModuleProgressStatus;
  progressPercent: number;
  startedAt: string | null;
  completedAt: string | null;
  lastSeenAt: string | null;
};

export type ProgressSyncResult = {
  productId: string;
  remoteBefore: ModuleProgress[];
  merged: ModuleProgressUpsertInput[];
  synced: ModuleProgress[];
};
