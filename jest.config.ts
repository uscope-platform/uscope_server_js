import type {Config} from 'jest';
import {pathsToModuleNameMapper} from "ts-jest";

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
  modulePaths: ["./src"],
  moduleNameMapper: pathsToModuleNameMapper({
      "#hw": ["hardware_interface/index.ts"],
      "#hw/*": ["hardware_interface/*"],
      "#api_backend": ["API/backend/index.ts"],
      "#api_backend/*": ["API/backend/*"],
      "#api_frontend": ["API/frontend/index.ts"],
      "#api_frontend/*": ["API/frontend/*"],
      "#database": ["Database/index.ts"],
      "#database/*": ["Database/*"],
      "#models": ["data_model/index.ts"],
      "#models/*": ["data_model/*"]
  }),
};

export default config;
