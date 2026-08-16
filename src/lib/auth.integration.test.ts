import { afterAll, beforeAll, describe, expect, it } from "vitest";
import prisma from "./prisma";
import { auth } from "./auth";

const unique = Date.now();
const TEST_EMAIL = `integration-${unique}@example.com`;
const TEST_PASSWORD = "integration-password";

async function signInHeaders() {
  const { headers } = await auth.api.signInEmail({
    returnHeaders: true,
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  const sessionHeaders = new Headers();
  sessionHeaders.set("cookie", headers.getSetCookie()[0]);
  return sessionHeaders;
}

describe("better-auth email/password integration", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
    await prisma.$disconnect();
  });

  it("signs up a new user", async () => {
    const user = await auth.api.signUpEmail({
      body: {
        name: "Integration Tester",
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      },
    });

    expect(user.user.email).toBe(TEST_EMAIL);
    expect(user.user.name).toBe("Integration Tester");
  });

  it("rejects duplicate email signup", async () => {
    await expect(
      auth.api.signUpEmail({
        body: {
          name: "Duplicate",
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        },
      }),
    ).rejects.toMatchObject({ status: "UNPROCESSABLE_ENTITY" });
  });

  it("signs in with correct credentials", async () => {
    const response = await auth.api.signInEmail({
      body: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });

    expect(response.user.email).toBe(TEST_EMAIL);
    expect(response.token).toBeTruthy();
  });

  it("rejects invalid credentials", async () => {
    await expect(
      auth.api.signInEmail({
        body: { email: TEST_EMAIL, password: "wrong-password" },
      }),
    ).rejects.toMatchObject({ status: "UNAUTHORIZED" });
  });

  it("returns a valid session with the auth cookie", async () => {
    const headers = await signInHeaders();
    const session = await auth.api.getSession({ headers });

    expect(session?.user.email).toBe(TEST_EMAIL);
    expect(session?.session.expiresAt).toBeTruthy();
  });

  it("returns null session without credentials", async () => {
    const session = await auth.api.getSession({ headers: new Headers() });
    expect(session).toBeNull();
  });

  it("signs out and invalidates the session", async () => {
    const headers = await signInHeaders();

    const { headers: signOutResponseHeaders, response } = await auth.api.signOut({
      returnHeaders: true,
      headers,
    });

    expect("error" in response).toBe(false);
    expect(signOutResponseHeaders.getSetCookie().length).toBeGreaterThan(0);

    const session = await auth.api.getSession({ headers });
    expect(session).toBeNull();
  });
});
