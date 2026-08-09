import "server-only";

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

const unknownValue = "No configurado";

function normalizeEnvironment(): SystemVersionInfo["environment"] {
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  return "development";
}

function normalizeCommit(value: string | undefined) {
  const commit = value?.trim();

  if (!commit) {
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

export function getSystemVersionInfo(domain: string | undefined): SystemVersionInfo {
  const commitInfo = normalizeCommit(
    process.env.APP_GIT_SHA || process.env.NEXT_PUBLIC_APP_GIT_SHA,
  );

  return {
    appName: "Invictus GEX",
    buildTime: normalizeBuildTime(
      process.env.APP_BUILD_TIME || process.env.NEXT_PUBLIC_APP_BUILD_TIME,
    ),
    domain: normalizeDomain(domain),
    environment: normalizeEnvironment(),
    version: packageInfo.version,
    ...commitInfo,
  };
}

export function formatSystemVersionForClipboard(info: SystemVersionInfo) {
  return [
    info.appName,
    `Version: ${info.version}`,
    `Commit: ${info.commit}`,
    `Build: ${info.buildTime}`,
    `Environment: ${info.environment}`,
    `Domain: ${info.domain}`,
  ].join("\n");
}
