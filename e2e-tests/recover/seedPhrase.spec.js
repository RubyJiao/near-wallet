const { createTestSubaccount } = require("../utils/account");

describe("Account Recovery Using Seed Phrase", () => {
    let testAccount;
    beforeAll(async () => {
        testAccount = await createTestSubaccount();
    });

    afterAll(async () => {
        await browser.close();
        await testAccount.delete();
    });

    it("navigates to seed phrase page successfully", async () => {
        const user = await page.goto("/").then(() => page.getDocument());

        const importAccountBtn = await user.findByRole("button", {
            name: "Import Existing Account",
        });
        await importAccountBtn.click();

        const recoverAccountBtn = await user.findByText("Recover Account");
        await recoverAccountBtn.click();

        expect(page).toMatchURL(/\/recover-seed-phrase$/);
    });

    it("recovers the account successfully", async () => {
        const user = await page.getDocument();

        const seedphraseInput = await user.findByRole("textbox");
        await seedphraseInput.type(testAccount.seedPhrase);

        const findMyAccountBtn = await user.findByRole("button");
        await findMyAccountBtn.click();

        await page.waitForNavigation();

        expect(page).toMatchURL(/.org\/$/);
        // TODO use data-testid prop
        expect(await page.textContent(".account-wrapper")).toBe(
            testAccount.account.accountId
        );
    });
});
