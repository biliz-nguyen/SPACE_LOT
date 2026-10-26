import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const root = process.cwd(),
  backup = path.resolve(root, "../backups/premium-20261026-212219");
const exclude = new Set([
  "node_modules",
  "dist",
  ".npm-cache",
  ".git",
  "test-results",
  "playwright-report",
  "artifacts",
  "SHA256.csv",
]);
async function files(directory, prefix = "") {
  const result = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    const relative = prefix + entry.name;
    if (relative === "public/cad") continue;
    if (entry.isDirectory()) {
      for (const [key, value] of await files(
        path.join(directory, entry.name),
        relative + "/",
      ))
        result.set(key, value);
    } else
      result.set(
        relative,
        createHash("sha256")
          .update(await readFile(path.join(directory, entry.name)))
          .digest("hex"),
      );
  }
  return result;
}
const before = await files(backup),
  after = await files(root),
  changes = [];
for (const [file, hash] of after) {
  if (!before.has(file)) changes.push({ path: file, status: "added" });
  else if (before.get(file) !== hash)
    changes.push({ path: file, status: "modified" });
}
for (const file of before.keys())
  if (!after.has(file)) changes.push({ path: file, status: "deleted" });
changes.sort((a, b) => a.path.localeCompare(b.path));
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/changed-files.json",
  JSON.stringify(
    {
      backup,
      comparedAt: new Date().toISOString(),
      excluded: [...exclude, "public/cad"],
      changes,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(changes, null, 2));
