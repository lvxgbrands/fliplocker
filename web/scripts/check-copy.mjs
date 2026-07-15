// Compliance guard: user-facing copy must never use these words.
// (COMPLIANCE-NOTES.md §1/§4 — approved framing is "inspection",
// "documentation", "held by our payment processor". We do not authenticate,
// so never say "verify/verified/verification" in user-facing copy either —
// say "document/documented/documentation".)
import { execSync } from "node:child_process";

// Plain case-insensitive substrings.
const FORBIDDEN = ["escrow", "authenticat", "licensed", "\\bbank\\b"];

// Boundary-aware patterns (Perl regex). The hyphen/underscore/letter guards let
// legitimate code identifiers through — verifyPassword, EMAIL_VERIFY, the
// VERIFIED enum, verification_status, /verify-email routes — while catching the
// English words "verify / verified / verification" wherever they surface in copy.
const FORBIDDEN_P = ["(?<![A-Za-z_-])[Vv]erif(y|ies|ied|ication|ications)(?![A-Za-z_-])"];

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
for (const word of FORBIDDEN_P) {
  try {
    const out = execSync(`grep -rnP '${word}' src prisma --include='*.ts' --include='*.tsx'`, { encoding: "utf8" });
    if (out.trim()) {
      console.error(`FORBIDDEN TERM /${word}/ found (user-facing verify/verification copy):\n${out}`);
      failed = true;
    }
  } catch { /* grep exits 1 when no match — that's a pass */ }
}
if (failed) process.exit(1);
console.log("Copy check passed — no forbidden terminology in src/ or prisma/.");
