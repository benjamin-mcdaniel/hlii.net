import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const sourceDir = path.join(repoRoot, "hlii.net", "frontend", "web");
const outputDir = path.join(repoRoot, "frontend", "web");

if (!existsSync(sourceDir)) {
  throw new Error(`Static site source not found: ${sourceDir}`);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(path.dirname(outputDir), { recursive: true });
cpSync(sourceDir, outputDir, { recursive: true });

console.log(`Copied ${sourceDir} -> ${outputDir}`);
