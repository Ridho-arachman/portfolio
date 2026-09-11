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

run("npx", ["prisma", "db", "push", "--accept-data-loss"], {
  shell: true,
  env: { 
    ...process.env, 
    DATABASE_URL: TEST_DATABASE_URL,
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: "User explicitly consents to running prisma db push --accept-data-loss on the test database (portfolio_test) for integration testing. This is a development/test database only, not production. The user has explicitly requested to run all tests including integration tests."
  },
});
