// Set env vars before importing
process.env.FUNCTION_NAME = "function name";
process.env.LOGGER_NAME = "logger-name";
process.env.FUNCTION_REGION = "us-east1";

import {
  IS_FIREBASE_FUNCTION,
  LOGGER_NAME,
  LOG_TO_CONSOLE,
  getFunctionMetadata,
} from "../src/envConst";

test("non-Cloud Run function configs with custom logger name and region", () => {
  const metadata = getFunctionMetadata();

  expect(LOGGER_NAME).toEqual("logger-name");
  expect(LOG_TO_CONSOLE).toEqual(false);
  expect(IS_FIREBASE_FUNCTION).toEqual(true);

  expect(metadata).toEqual({
    resource: {
      labels: {
        region: "us-east1",
        function_name: "function name",
      },
      type: "cloud_function",
    },
  });
});
