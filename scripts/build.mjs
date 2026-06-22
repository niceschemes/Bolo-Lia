import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const INNER_FLAG = ".open-next-inner-build";

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

// OpenNext chama `npm run build` por dentro — só roda next build nessa fase.
if (existsSync(INNER_FLAG)) {
  run("npx next build");
  process.exit(0);
}

// Cloudflare CI: build completo OpenNext (gera .open-next para o wrangler deploy).
if (process.env.CI === "true") {
  writeFileSync(INNER_FLAG, "");
  try {
    run("npx opennextjs-cloudflare build");
  } finally {
    unlinkSync(INNER_FLAG);
  }
  process.exit(0);
}

// Local: next build normal.
run("npx next build");
