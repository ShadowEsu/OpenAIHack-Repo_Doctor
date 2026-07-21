import path from "node:path";
import { expect, test } from "playwright/test";

test("uploads a repository, examines it, and renders the real dashboard", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.goto("/connect");
  await expect(page.getByRole("heading", { name: "Connect Repository" })).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);

  await page.getByLabel("Upload ZIP file").setInputFiles(
    path.resolve("sample-repositories/messy-demo.zip")
  );

  await expect(page).toHaveURL(/\/app\/repos\/[a-f0-9]+$/, { timeout: 120_000 });
  await expect(page.getByText("Repository Health")).toBeVisible();
  await expect(page.getByText("Needs Attention", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Top Priority" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View All Diagnoses/ })).toBeVisible();
  await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  await page.screenshot({ path: "screenshots/repo-doctor-e2e.png", fullPage: true });
  expect(browserErrors).toEqual([]);
});
