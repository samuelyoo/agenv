import { buildRecommendedManifest } from "../../src/manifest/defaults.js";
import type { Manifest } from "../../src/manifest/schema.js";

export function dashboardManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-dashboard",
    framework: "nextjs",
    projectType: "dashboard",
    ...overrides,
  });
}

export function webAppManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-web-app",
    framework: "nextjs",
    projectType: "web-app",
    ...overrides,
  });
}

export function apiServiceManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-api",
    framework: "express",
    projectType: "api-service",
    ...overrides,
  });
}

export function fullStackManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-saas",
    framework: "nextjs",
    projectType: "full-stack",
    ...overrides,
  });
}

export function libraryManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-lib",
    framework: "react",
    projectType: "library",
    ...overrides,
  });
}

export function cliToolManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-cli",
    framework: "express",
    projectType: "cli-tool",
    ...overrides,
  });
}

export function mobileManifest(overrides?: Partial<Parameters<typeof buildRecommendedManifest>[0]>): Manifest {
  return buildRecommendedManifest({
    name: "test-app",
    framework: "react",
    projectType: "mobile",
    ...overrides,
  });
}
