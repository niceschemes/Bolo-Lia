import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const migrationsDir = "prisma/migrations";
const dirs = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

for (const dir of dirs) {
  const file = join(migrationsDir, dir, "migration.sql");
  if (!existsSync(file)) continue;
  console.log(`\n→ ${file}`);
  try {
    execSync(`npx wrangler d1 execute bolo-lia-db --remote --file "${file}" -y`, {
      stdio: "inherit",
      shell: true,
    });
  } catch {
    console.warn(`(pulando) ${file} — provavelmente já aplicada`);
  }
}
