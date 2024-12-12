/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
    detectOpenHandles: true,
    testTimeout: 15000,
    collectCoverage: true,
    coverageDirectory: "coverage",
    moduleNameMapper: {
        "^@services/(.*)$": "<rootDir>/src/services/$1",
        "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
        "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
        "^@DB$": "<rootDir>/src/prisma/PrismaClient",
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@validators/(.*)$": "<rootDir>/src/validators/$1",
        "^@routes/(.*)$": "<rootDir>/src/routes/$1",
        "^@src/(.*)$": "<rootDir>/src/$1",
        "^@socket/(.*)$": "<rootDir>/src/socket/$1",
        "@agora/(.*)$": "<rootDir>/src/agora/$1",
    },
    globalSetup: "./jest.setup.js", // Path to the setup script
};