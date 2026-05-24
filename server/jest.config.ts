/*
Planning note:
- Responsibility: API-level test runner configuration.
- Future logic focus: controller/service segregation tests, integration database lifecycle, and response contract assertions.
*/

export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }]
  },
  roots: ["<rootDir>/src"]
};