import { access } from "node:fs/promises";

const requiredFiles = [
  "index.html",
  "reports.html",
  "method.html",
  "styles.css",
  "app.js",
  "viewer.js",
  "reports/index.json"
];

await Promise.all(
  requiredFiles.map(async (file) => {
    await access(new URL(file, import.meta.url));
  })
);

console.log("HLII frontend/web build check passed.");
