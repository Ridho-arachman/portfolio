import { expect, test } from "@playwright/test";

test("renders the contact section with a form", async ({ page }) => {
  await page.goto("/en/contact");

  await expect(
    page.getByRole("heading", { name: "Have a project in mind?" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Subject" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message" })).toBeVisible();
});

test("shows validation errors on empty submit", async ({ page }) => {
  await page.goto("/en/contact");

  await page.getByRole("button", { name: "Send Message" }).click();

  // Form publik memakai `createContactFormSchema(t.contact.form.validation)`,
  // jadi yang tampil adalah pesan i18n, bukan string default di `schema/contact.ts`
  // yang hanya dipakai `POST /api/contact`.
  await expect(page.getByText("Name is required")).toBeVisible();
  await expect(page.getByText("Email is required")).toBeVisible();
  await expect(page.getByText("Subject is required")).toBeVisible();
  await expect(page.getByText("Message is required")).toBeVisible();
});

test("submits a valid message and shows success", async ({ page }) => {
  await page.goto("/en/contact");

  await page.getByRole("textbox", { name: "Name" }).fill("E2E Tester");
  await page.getByRole("textbox", { name: "Email" }).fill("e2e@example.com");
  await page.getByRole("textbox", { name: "Subject" }).fill("Playwright Test");
  await page.getByRole("textbox", { name: "Message" }).fill(
    "This is an end-to-end test message from Playwright.",
  );

  await page.getByRole("button", { name: "Send Message" }).click();

  await expect(
    page.getByText(/thank you for reaching out/i),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send Another Message" }),
  ).toBeVisible();
});

test("indonesian locale renders translated copy", async ({ page }) => {
  await page.goto("/id/contact");

  await expect(
    page.getByRole("heading", { name: "Punya proyek di pikiran? Mari ngobrol." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Kirim Pesan" }),
  ).toBeVisible();
});
