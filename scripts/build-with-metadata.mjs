import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const metadataPath = join(process.cwd(), ".next", "invictus-build-info.json");
const temporaryMetadataPath = `${metadataPath}.tmp`;
const gitShaPattern = /^[a-f0-9]{7,40}$/i;

const shaEnvironmentKeys = [
  "APP_GIT_SHA",
  "GITHUB_SHA",
  "VERCEL_GIT_COMMIT_SHA",
  "CF_PAGES_COMMIT_SHA",
  "CI_COMMIT_SHA",
  "COMMIT_SHA",
  "SOURCE_VERSION",
];

function normalizeGitSha(value) {
  const sha = value?.trim().toLowerCase();

  return sha && gitShaPattern.test(sha) ? sha : null;
}

function detectShaFromEnvironment() {
  for (const key of shaEnvironmentKeys) {
    const sha = normalizeGitSha(process.env[key]);

    if (sha) {
      return {
        sha,
        source: key,
      };
    }
  }

  return null;
}

function detectShaFromGit() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
    shell: false,
    stdio: ["ignore", "pipe", "ignore"],
  });
  const sha = normalizeGitSha(result.stdout);

  return sha
    ? {
        sha,
        source: "git rev-parse HEAD",
      }
    : null;
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const nextCliPath = join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "bin",
      "next",
    );
    const child = spawn(process.execPath, [nextCliPath, "build"], {
      env: process.env,
      shell: false,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`next build exited with code ${code}`));
    });
  });
}

async function writeBuildMetadata() {
  const detectedSha = detectShaFromEnvironment() ?? detectShaFromGit();
  const metadata = {
    buildTime: new Date().toISOString(),
    gitSha: detectedSha?.sha ?? null,
    gitShaSource: detectedSha?.source ?? null,
  };

  await mkdir(dirname(metadataPath), { recursive: true });
  await writeFile(
    temporaryMetadataPath,
    `${JSON.stringify(metadata, null, 2)}\n`,
    "utf8",
  );
  await rename(temporaryMetadataPath, metadataPath);

  console.log(
    metadata.gitSha
      ? `Build metadata written with commit ${metadata.gitSha.slice(0, 7)} from ${metadata.gitShaSource}.`
      : "Build metadata written without a detected commit SHA.",
  );
}

await runNextBuild();
await writeBuildMetadata();
