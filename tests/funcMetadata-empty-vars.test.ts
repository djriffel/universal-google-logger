import {
  IS_FIREBASE_FUNCTION,
  LOGGER_NAME,
  LOG_TO_CONSOLE,
  PROJECT_STRING_ID,
  getFunctionMetadata,
} from "../src/envConst";

const defaultMetaData = {
  resource: {
    labels: {
      region: "us-central1",
    },
    type: "cloud_function",
  },
};

describe("default configs based on empty environment vars", () => {
  test("matches expected defaults", () => {
    const metadata = getFunctionMetadata();

    expect(LOGGER_NAME).toEqual("node-app");
    expect(LOG_TO_CONSOLE).toEqual(false);
    expect(IS_FIREBASE_FUNCTION).toEqual(false);
    expect(PROJECT_STRING_ID).toEqual("Mock MetaData Project ID");

    expect(metadata).toEqual(defaultMetaData);
  });

  test("retains config from original environment vars", () => {
    process.env.K_SERVICE = "service";
    process.env.K_REVISION = "revision";
    process.env.K_CONFIGURATION = "configuration";

    const metadata = getFunctionMetadata();

    expect(LOGGER_NAME).toEqual("node-app");
    expect(LOG_TO_CONSOLE).toEqual(false);
    expect(IS_FIREBASE_FUNCTION).toEqual(false);
    expect(PROJECT_STRING_ID).toEqual("Mock MetaData Project ID");

    expect(metadata).toEqual(defaultMetaData);
  });
});
