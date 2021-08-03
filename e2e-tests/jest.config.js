module.exports = {
    preset: "@hover/jest-playwright-preset",
    setupFiles: ['dotenv/config'],
    setupFilesAfterEnv: ["expect-playwright"],
    testTimeout: 30000
};