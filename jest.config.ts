import type { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: __dirname,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageReporters: ["text", "cobertura", "html"],
} satisfies Config;
