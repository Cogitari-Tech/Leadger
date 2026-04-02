const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// When called with args (lint-staged), scan those files.
// When called without args (pre-push, CI), scan all tracked files.
let files = process.argv.slice(2);

if (files.length === 0) {
  try {
    const output = execSync("git ls-files --cached", { encoding: "utf-8" });
    files = output
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
  } catch {
    console.warn("⚠️  Could not list git files. Skipping file scan.");
    files = [];
  }
}

console.log(`Running Security Scan on ${files.length} file(s)...`);

let hasError = false;

// 1. Block .env files
const envFiles = files.filter(
  (f) => path.basename(f).startsWith(".env") && !f.endsWith(".example"),
);
if (envFiles.length > 0) {
  console.error("❌ SECURITY ERROR: .env files detected in staged area:");
  envFiles.forEach((f) => console.error(`   - ${f}`));
  hasError = true;
}

// 2. Secret patterns to detect
const secretPatterns = [
  { name: "Stripe/OpenAI Key", regex: /sk_(live|test)_\w{10,}/ },
  { name: "GitHub Token", regex: /ghp_\w{10,}/ },
  { name: "GitHub PAT (Fine-grained)", regex: /github_pat_\w{10,}/ },
  { name: "GitHub OAuth Secret", regex: /gho_\w{10,}/ },
  { name: "JWT Token", regex: /eyJ[a-zA-Z0-9_-]{20,}\.eyJ/ },
  { name: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/ },
  { name: "Supabase Access Token", regex: /sbp_[a-f0-9]{30,}/ },
  { name: "Upstash Redis URL", regex: /rediss?:\/\/default:[A-Za-z0-9]+@/ },
  {
    name: "Private Key Block",
    regex: new RegExp("-----BEGIN " + "(RSA |EC )?PRIVATE KEY-----"),
  },
  {
    name: "Generic Secret Assignment",
    regex: /(?:password|secret|token)\s*[:=]\s*["'][^"']{8,}["']/i,
  },
];

// 3. Binary extensions to skip
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".ico",
  ".pdf",
  ".zip",
  ".webp",
  ".woff",
  ".woff2",
  ".eot",
  ".ttf",
  ".otf",
  ".svg",
  ".mp4",
  ".mp3",
  ".tar",
  ".gz",
  ".br",
  ".wasm",
  ".map",
]);

// 4. Paths to always skip (docs, configs that mention var names)
const SKIP_PATH_PATTERNS = [
  /(^|[\\\/])\.husky[\\\/]/,
  /CLAUDE\.md$/,
  /(^|[\\\/])\.claude[\\\/]rules[\\\/]/,
  /\.md$/,
  /\.example$/,
  /(^|[\\\/])node_modules[\\\/]/,
  /package-lock\.json$/,
  /(^|[\\\/])scripts[\\\/]/, // Dev/test utilities with test credentials
  /(^|[\\\/])supabase[\\\/]/, // Supabase config/functions (reviewed separately)
  /(^|[\\\/])\.agent[\\\/]/, // AI agent configs
];

files.forEach((file) => {
  // Skip by path pattern
  if (SKIP_PATH_PATTERNS.some((p) => p.test(file))) return;

  // Skip binary
  const ext = path.extname(file).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return;

  try {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      const content = fs.readFileSync(file, "utf-8");

      secretPatterns.forEach((pattern) => {
        if (pattern.regex.test(content)) {
          console.error(
            `❌ SECURITY: Potential ${pattern.name} found in ${file}`,
          );
          hasError = true;
        }
      });
    }
  } catch {
    // Ignore read errors for deleted/moved files
  }
});

if (hasError) {
  console.error(
    "\n⛔ Security check FAILED. Remove secrets before committing.",
  );
  process.exit(1);
} else {
  console.log("✅ Security check passed.");
}
