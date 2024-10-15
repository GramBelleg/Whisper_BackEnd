/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },

    moduleNameMapper: {
        "^@services/(.*)$": "<rootDir>/src/services/$1",
        "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
        "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
        "^@DB$": "<rootDir>/src/prisma/PrismaClient",
        "^@config/(.*)$": "<rootDir>/src/config/$1",
        "^@validators/(.*)$": "<rootDir>/src/validators/$1",
        "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    },
};
