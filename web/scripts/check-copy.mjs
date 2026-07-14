// Compliance guard: user-facing copy must never use these words.
// (COMPLIANCE-NOTES.md §1/§4 — approved framing is "inspection",
// "documentation", "verified", "held by our payment processor".)
import { execSync } from "node:child_process";
const FORBIDDEN = ["escrow", "authenticat", "licensed", "\\bbank\\b"];
let failed = false;
for (const word of FORBIDDEN) {
  try {
    const out = execSync(`grep -rniE '${word}' src prisma --include='*.ts' --include='*.tsx'`, { encoding: "utf8" });
    if (out.trim()) {
      console.error(`FORBIDDEN TERM /${word}/ found:\n${out}`);
      failed = true;
    }
  } catch { /* grep exits 1 when no match — that's a pass */ }
}
if (failed) process.exit(1);
console.log("Copy check passed — no forbidden terminology in src/ or prisma/.");
