import {
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

const repositoryRoot = resolve(import.meta.dir, "..");
const docsRoot = join(repositoryRoot, "content/docs");
const allDocuments = process.argv[2] === "--all";
const [baseCommit, headCommit] = allDocuments ? [] : process.argv.slice(2);

async function run(command: string[]): Promise<string> {
  const child = Bun.spawn(command, { stdout: "pipe", stderr: "pipe" });
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);

  if (exitCode !== 0) {
    throw new Error(stderr.trim() || `Command failed: ${command.join(" ")}`);
  }

  return stdout.trim();
}

function listMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listMarkdownFiles(path);
    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

async function changedMarkdownPaths(): Promise<string[]> {
  if (!baseCommit || !headCommit) {
    throw new Error(
      "Usage: bun scripts/refresh-last-updated.ts <base-commit> <head-commit> | --all",
    );
  }

  const range = /^0+$/.test(baseCommit)
    ? `${headCommit}^!`
    : `${baseCommit}..${headCommit}`;
  const paths = await run([
    "git",
    "-C",
    repositoryRoot,
    "diff",
    "--name-only",
    "--diff-filter=AMR",
    range,
    "--",
    "content/docs",
  ]);
  return paths ? paths.split("\n").filter((path) => path.endsWith(".md")) : [];
}

function writeAtomically(path: string, content: string): void {
  const temporaryPath = `${path}.tmp-${randomUUID()}`;
  try {
    writeFileSync(temporaryPath, content, { encoding: "utf8", flag: "wx" });
    renameSync(temporaryPath, path);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function refreshLastUpdated(
  markdown: string,
  lastUpdated: string,
  path: string,
): string {
  const frontmatter = markdown.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)/);
  if (!frontmatter)
    throw new Error(`Markdown document is missing valid frontmatter: ${path}`);

  const metadata = /^lastUpdated:\s*.*$/m.test(frontmatter[2])
    ? frontmatter[2].replace(
        /^lastUpdated:\s*.*$/m,
        `lastUpdated: '${lastUpdated}'`,
      )
    : `${frontmatter[2]}\nlastUpdated: '${lastUpdated}'`;
  return `${frontmatter[1]}${metadata}${frontmatter[3]}${markdown.slice(frontmatter[0].length)}`;
}

function asUtcTimestamp(timestamp: string, path: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid Git timestamp for ${path}: ${timestamp}`);
  }

  return date.toISOString().replace(".000Z", "Z");
}

async function main(): Promise<void> {
  const documentPaths = allDocuments
    ? listMarkdownFiles(docsRoot).map((path) =>
        relative(repositoryRoot, path).split(sep).join("/"),
      )
    : await changedMarkdownPaths();
  const revisionRange = allDocuments ? "HEAD" : `${baseCommit}..${headCommit}`;

  for (const documentPath of documentPaths) {
    const lastUpdated = await run([
      "git",
      "-C",
      repositoryRoot,
      "log",
      "-1",
      "--format=%cI",
      revisionRange,
      "--",
      documentPath,
    ]);
    if (!lastUpdated)
      throw new Error(
        `Cannot determine the last update timestamp for ${documentPath}`,
      );

    const utcTimestamp = asUtcTimestamp(lastUpdated, documentPath);
    const absolutePath = join(repositoryRoot, documentPath);
    const updated = refreshLastUpdated(
      readFileSync(absolutePath, "utf8"),
      utcTimestamp,
      documentPath,
    );
    writeAtomically(absolutePath, updated);
    console.log(`Updated ${documentPath} at ${utcTimestamp}`);
  }
}

await main();
