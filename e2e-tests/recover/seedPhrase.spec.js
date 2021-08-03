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
        await user
            .findByRole("button", {
                name: "Import Existing Account",
            })
            .then((importAccountBtn) => importAccountBtn.click())
            .then(() => user.findByText("Recover Account"))
            .then((recoverAccountBtn) => recoverAccountBtn.click());

        expect(page).toMatchURL(/\/recover-seed-phrase$/);
    });

    it("recovers the account successfully", async () => {
        const user = await page.getDocument();
        await user
            .findByRole("textbox")
            .then((seedphraseInput) =>
                seedphraseInput.type(testAccount.seedPhrase)
            )
            .then(() => user.findByRole("button"))
            .then((btn) => btn.click())
            .then(() => page.waitForNavigation());

        expect(page).toMatchURL(/.org\/$/);
        // TODO use data-testid prop
        expect(await page.textContent(".account-wrapper")).toBe(
            testAccount.account.accountId
        );
    });
});
