/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src"],
    setupFiles: ['<rootDir>/jest.setup.ts'],
    testMatch: ['**/*.test.ts']
};

