import { expect, test } from "@playwright/test";

test("renders the contact section with a form", async ({ page }) => {
  await page.goto("/contact");

  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    "Together",
  );
  await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Subject" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
});

test("shows validation errors on empty submit", async ({ page }) => {
  await page.goto("/contact");

  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(
    page.getByText("Name must be at least 2 characters"),
  ).toBeVisible();
  await expect(
    page.getByText("Please enter a valid email address"),
  ).toBeVisible();
  await expect(
    page.getByText("Subject must be at least 3 characters"),
  ).toBeVisible();
  await expect(
    page.getByText("Message must be at least 10 characters"),
  ).toBeVisible();
});

test("submits a valid message and shows success", async ({ page }) => {
  await page.goto("/contact");

  await page.getByRole("textbox", { name: "Name" }).fill("E2E Tester");
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@example.com");
  await page.getByRole("textbox", { name: "Subject" }).fill("Playwright Test");
  await page.getByRole("textbox", { name: "Message" }).fill(
    "This is an end-to-end test message from Playwright.",
  );

  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(page.getByText("Message sent!")).toBeVisible();
  await expect(
    page.getByText(/thank you for reaching out/i),
  ).toBeVisible();
});
