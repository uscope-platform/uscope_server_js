import type {Config} from 'jest';

const config: Config = {

  // Stop running tests after `n` failures
  // bail: 0,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  roots: ["<rootDir>/test"],
  preset: "ts-jest",
  testEnvironment: 'node'

};

export default config;
