require('playwright-testing-library/extend')

module.exports = {
    contextOptions: {
        baseURL: process.env.WALLET_URL || 'https://wallet.testnet.near.org',
        viewport: { width: 1280, height: 720 },
    },
    launchOptions: {
        headless: false
    },
    devices: ["Pixel 5", "iPhone 12", "Desktop Chrome", "Desktop Firefox"]
}