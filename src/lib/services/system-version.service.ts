import "server-only";

import { BUILD_INFO } from "@/generated/build-info";
import packageInfo from "../../../package.json";

export type SystemVersionInfo = {
  appName: string;
  version: string;
  commit: string;
  commitFull: string | null;
  buildTime: string;
  environment: "development" | "production" | "test";
  domain: string;
};

export type GitHubMainCommitInfo = {
  sha: string;
  shortSha: string;
  message: string | null;
  committedAt: string | null;
};

export type VersionComparisonStatus =
  | "up_to_date"
  | "update_pending"
  | "deployed_version_unknown"
  | "verification_failed";

export type SystemVersionStatus = {
  deployed: SystemVersionInfo;
  github: GitHubMainCommitInfo | null;
  status: VersionComparisonStatus;
  checkedAt: string;
  error: string | null;
};

const unknownValue = "No configurado";
const githubOwner = "invictusgex";
const githubRepo = "invictus-academy";
const githubBranch = "main";
const githubCacheTtlMs = 120_000;
const githubRequestTimeoutMs = 5_000;

type GitHubCacheEntry = {
  expiresAt: number;
  value: GitHubMainCommitInfo;
};

let githubMainCommitCache: GitHubCacheEntry | null = null;

function normalizeEnvironment(): SystemVersionInfo["environment"] {
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  return "development";
}

export function formatSystemEnvironment(
  environment: SystemVersionInfo["environment"],
) {
  if (environment === "production") {
    return "Producción";
  }

  if (environment === "test") {
    return "Pruebas";
  }

  return "Desarrollo";
}

function normalizeCommit(value: string | undefined) {
  const commit = value?.trim();

  if (!commit || !isValidGitSha(commit)) {
    return {
      commit: unknownValue,
      commitFull: null,
    };
  }

  return {
    commit: commit.slice(0, 7),
    commitFull: commit,
  };
}

function normalizeBuildTime(value: string | undefined) {
  return value?.trim() || unknownValue;
}

function normalizeDomain(value: string | undefined) {
  return value?.trim() || unknownValue;
}

function isValidGitSha(value: string) {
  return /^[a-f0-9]{7,40}$/i.test(value.trim());
}

function normalizeGitSha(value: string | null) {
  const sha = value?.trim().toLowerCase();

  return sha && isValidGitSha(sha) ? sha : null;
}

function compareGitSha(deployedSha: string | null, githubSha: string | null) {
  if (!deployedSha || !githubSha) {
    return false;
  }

  if (deployedSha.length === 40) {
    return deployedSha === githubSha;
  }

  return githubSha.startsWith(deployedSha);
}

export function getSystemVersionInfo(domain: string | undefined): SystemVersionInfo {
  const commitInfo = normalizeCommit(
    process.env.APP_GIT_SHA ||
      process.env.NEXT_PUBLIC_APP_GIT_SHA ||
      BUILD_INFO.gitSha ||
      undefined,
  );

  return {
    appName: "Invictus GEX",
    buildTime: normalizeBuildTime(
      process.env.APP_BUILD_TIME ||
        process.env.NEXT_PUBLIC_APP_BUILD_TIME ||
        BUILD_INFO.buildTime ||
        undefined,
    ),
    domain: normalizeDomain(domain),
    environment: normalizeEnvironment(),
    version: packageInfo.version,
    ...commitInfo,
  };
}

async function fetchGitHubMainCommit() {
  const now = Date.now();

  if (githubMainCommitCache && githubMainCommitCache.expiresAt > now) {
    return githubMainCommitCache.value;
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "invictus-gex-admin-version-check",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const githubToken = process.env.GITHUB_TOKEN?.trim();

  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${githubOwner}/${githubRepo}/commits/${githubBranch}`,
    {
      cache: "no-store",
      headers,
      signal: AbortSignal.timeout(githubRequestTimeoutMs),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }

  const payload = (await response.json()) as {
    sha?: string;
    commit?: {
      message?: string;
      committer?: {
        date?: string;
      };
    };
  };
  const sha = normalizeGitSha(payload.sha ?? null);

  if (!sha) {
    throw new Error("GitHub API returned an invalid commit SHA");
  }

  const commitInfo: GitHubMainCommitInfo = {
    committedAt: payload.commit?.committer?.date ?? null,
    message: payload.commit?.message?.split("\n")[0]?.trim() || null,
    sha,
    shortSha: sha.slice(0, 7),
  };

  githubMainCommitCache = {
    expiresAt: now + githubCacheTtlMs,
    value: commitInfo,
  };

  return commitInfo;
}

export function compareSystemVersion(
  deployed: SystemVersionInfo,
  github: GitHubMainCommitInfo | null,
  error: string | null,
): SystemVersionStatus {
  if (error || !github) {
    return {
      checkedAt: new Date().toISOString(),
      deployed,
      error,
      github,
      status: "verification_failed",
    };
  }

  const deployedSha = normalizeGitSha(deployed.commitFull);

  if (!deployedSha) {
    return {
      checkedAt: new Date().toISOString(),
      deployed,
      error: null,
      github,
      status: "deployed_version_unknown",
    };
  }

  return {
    checkedAt: new Date().toISOString(),
    deployed,
    error: null,
    github,
    status: compareGitSha(deployedSha, github.sha)
      ? "up_to_date"
      : "update_pending",
  };
}

export async function getSystemVersionStatus(domain: string | undefined) {
  const deployed = getSystemVersionInfo(domain);

  try {
    const github = await fetchGitHubMainCommit();

    return compareSystemVersion(deployed, github, null);
  } catch (error) {
    return compareSystemVersion(
      deployed,
      null,
      error instanceof Error ? error.message : "No fue posible consultar GitHub",
    );
  }
}

export function formatVersionStatusLabel(status: VersionComparisonStatus) {
  if (status === "up_to_date") {
    return "ACTUALIZADO";
  }

  if (status === "update_pending") {
    return "ACTUALIZACIÓN PENDIENTE";
  }

  if (status === "deployed_version_unknown") {
    return "VERSIÓN DESPLEGADA NO IDENTIFICADA";
  }

  return "NO SE PUDO VERIFICAR";
}

export function formatSystemVersionForClipboard(info: SystemVersionStatus) {
  return [
    info.deployed.appName,
    `Versión: ${info.deployed.version}`,
    `Entorno: ${formatSystemEnvironment(info.deployed.environment)}`,
    `Desplegado: ${info.deployed.commit}`,
    `GitHub main: ${info.github?.shortSha ?? unknownValue}`,
    `Estado: ${formatVersionStatusLabel(info.status)}`,
    `Build: ${info.deployed.buildTime}`,
    `Dominio: ${info.deployed.domain}`,
  ].join("\n");
}
