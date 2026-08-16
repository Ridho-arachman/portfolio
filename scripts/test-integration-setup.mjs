import { spawnSync } from "node:child_process";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/portfolio_test";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("docker", [
  "compose",
  "-f",
  "docker/docker-compose.test.yml",
  "up",
  "-d",
]);

run("npx", ["prisma", "db", "push"], {
  shell: true,
  env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
});
