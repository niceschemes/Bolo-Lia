import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

if (
  process.env.CI !== "true" ||
  !process.env.CLOUDFLARE_API_TOKEN ||
  existsSync(".open-next-inner-build")
) {
  process.exit(0);
}

function run(cmd, optional = false) {
  try {
    execSync(cmd, { stdio: "inherit", shell: true });
  } catch (error) {
    if (!optional) throw error;
    console.warn(`(continuando) ${cmd}`);
  }
}

console.log("\n── D1: migrations + seed (CI) ──\n");
run("node scripts/d1-migrate.mjs", true);
run('npx wrangler d1 execute bolo-lia-db --remote --file "prisma/d1-seed.sql" -y', true);
console.log("\n── D1 setup concluído ──\n");
