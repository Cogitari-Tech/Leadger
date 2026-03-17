const fs = require("fs");

const filesToFix = [
  "apps/web/src/modules/admin/pages/RoleManagement.tsx",
  "apps/web/src/modules/audit/hooks/useAuditApproval.ts",
  "apps/web/src/modules/audit/repositories/SupabaseAuditRepository.ts",
  "apps/web/src/modules/auth/context/TenantContext.tsx",
  "apps/web/src/modules/compliance/pages/ComplianceDashboard.tsx",
  "apps/web/src/modules/compliance/repositories/SupabaseComplianceRepository.ts",
  "apps/web/src/modules/dashboard/hooks/useExecutiveDashboard.ts",
];

for (const file of filesToFix) {
  let content = fs.readFileSync(file, "utf8");

  // Specific replaces based on compilation errors
  content = content.replace(
    /rolesData\?\.map\(\(r\)/g,
    "rolesData?.map((r: any)",
  );
  content = content.replace(
    /\(rolesData \?\? \[\]\)\.map\(\s*\(r\)/g,
    "(rolesData ?? []).map((r: any)",
  );

  content = content.replace(
    /findings\.find\(\s*\(f\)/g,
    "findings.find((f: any)",
  );

  content = content.replace(/\.map\(\(row\)/g, ".map((row: any)");
  content = content.replace(/\.map\(\(f\)/g, ".map((f: any)");
  content = content.replace(/\.filter\(\(f\)/g, ".filter((f: any)");

  content = content.replace(/\.map\(\(p\)/g, ".map((p: any)");
  content = content.replace(/\.filter\(\(p\)/g, ".filter((p: any)");

  content = content.replace(
    /\.reduce\(\(acc, d\)/g,
    ".reduce((acc: any, d: any)",
  );
  content = content.replace(
    /\.reduce\(\(acc, c\)/g,
    ".reduce((acc: any, c: any)",
  );

  content = content.replace(
    /\.reduce\(\(acc, r\)/g,
    ".reduce((acc: any, r: any)",
  );
  content = content.replace(/\.filter\(\(r\)/g, ".filter((r: any)");

  content = content.replace(/\.filter\(\(c\)/g, ".filter((c: any)");
  content = content.replace(/\.filter\(\(a\)/g, ".filter((a: any)");

  content = content.replace(/controls\.map\(\(c\)/g, "controls.map((c: any)");

  fs.writeFileSync(file, content, "utf8");
}
console.log("TS7006 any replacements completed!");
