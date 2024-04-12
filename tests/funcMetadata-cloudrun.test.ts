// Set cloud-run specific env vars before importing
process.env.K_SERVICE = "service";
process.env.K_REVISION = "revision";
process.env.K_CONFIGURATION = "configuration";

import {
  IS_FIREBASE_FUNCTION,
  LOGGER_NAME,
  LOG_TO_CONSOLE,
  getFunctionMetadata,
} from "../src/envConst";

describe("default Cloud Run function configs", () => {
  test("no custom metadata", () => {
    const metadata = getFunctionMetadata();

    expect(LOGGER_NAME).toEqual("node-app");
    expect(LOG_TO_CONSOLE).toEqual(false);
    expect(IS_FIREBASE_FUNCTION).toEqual(true);

    expect(metadata).toEqual({
      resource: {
        labels: {
          configuration_name: "configuration",
          location: "us-central1",
          revision_name: "revision",
          service_name: "service",
        },
        type: "cloud_run_revision",
      },
    });
  });

  test("with custom metadata", () => {
    const metadata = getFunctionMetadata({
      resource: {
        labels: {
          configuration_name: "shouldBeOverwritten",
          location: "shouldBeOverwritten",
          revision_name: "shouldBeOverwritten",
          service_name: "shouldBeOverwritten",
          foo: "bar",
          test: 123,
        },
        type: "shouldBeOverwritten",
      },
    });

    expect(metadata).toEqual({
      resource: {
        labels: {
          configuration_name: "configuration",
          location: "us-central1",
          revision_name: "revision",
          service_name: "service",
          foo: "bar",
          test: 123,
        },
        type: "cloud_run_revision",
      },
    });
  });
});
