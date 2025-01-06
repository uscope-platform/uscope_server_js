import type {Config} from 'jest';
import {pathsToModuleNameMapper} from "ts-jest";
import options from "./tsconfig.json"
const config: Config = {


  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  modulePaths: [options.compilerOptions.baseUrl], // <-- This will be set to 'baseUrl' value
  moduleNameMapper: pathsToModuleNameMapper(options.compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
};

export default config;
