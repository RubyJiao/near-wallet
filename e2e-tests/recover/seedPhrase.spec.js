const { test, expect } = require("@playwright/test");

const { createTestSubaccount } = require("../utils/account");

const { describe, beforeAll, afterAll } = test;

describe("Account Recovery Using Seed Phrase", () => {
    let testAccount;

    beforeAll(async () => {
        testAccount = await createTestSubaccount();
    });

    /** Note: afterAll hook does not currently run if tests timeout / fail:
     * https://github.com/microsoft/playwright/pull/8008
     */
    afterAll(async () => {
        await testAccount.delete();
    });

    test("navigates to seed phrase page successfully", async ({ page }) => {
        await page.goto("/");

        await page.click(
            `button:text-matches("Import Existing Account", "i")`
        );
        await page.click(`a:text-matches("Recover Account", "i")`);

        expect(page).toMatchURL(/\/recover-seed-phrase$/);
    });

    test("Account Recovery Using Seed Phrase", async ({ page }) => {
        await page.goto("/recover-seed-phrase");

        await page.fill(
            "data-test-id=seedPhraseRecoveryInput",
            testAccount.seedPhrase
        );
        await page.click(`[type="submit"]`);

        await page.waitForNavigation();

        expect(page).toMatchURL(/\/$/);
        expect(await page.textContent("data-test-id=currentUser")).toBe(
            testAccount.account.accountId
        );
    });
});
