// Set cloud-run specific env vars before importing
process.env.K_SERVICE = "service";
process.env.K_REVISION = "revision";
process.env.K_CONFIGURATION = "configuration";
process.env.npm_package_version = "test_version";

const mockEntry = jest
  .fn()
  .mockImplementation((metadata: object, data: object | string) => ({
    metadata,
    data,
  }));
const mockWrite = jest.fn();

const mockLogger = {
  name: "",
  entry: mockEntry,
  write: mockWrite,
};

const mockLogging = jest.fn().mockReturnValue({
  log: (name: string) => {
    mockLogger.name = name;
    return mockLogger;
  },
});

jest.mock("@google-cloud/logging", () => {
  const actualTracker = jest.requireActual("@google-cloud/logging");
  return {
    ...actualTracker,
    Logging: mockLogging,
  };
});

const spyDebug = jest.spyOn(global.console, "debug");
const spyLog = jest.spyOn(global.console, "log");
const spyInfo = jest.spyOn(global.console, "info");
const spyWarn = jest.spyOn(global.console, "warn");
const spyError = jest.spyOn(global.console, "error");

// const googleLogging = jest.requireActual("@google-cloud/logging");
// jest.spyOn(googleLogging, "Logging").mockImplementation(loggingerviceMock);

import {
  UniversalGoogleLogger,
  alert,
  critical,
  debug,
  emergency,
  error,
  info,
  log,
  notice,
  warning,
} from "../src";

const expectedResult = (severity: string, data: string | {}) => ({
  data,
  metadata: {
    labels: {
      node_app_version: "test_version",
    },
    resource: {
      labels: {
        configuration_name: "configuration",
        location: "us-central1",
        revision_name: "revision",
        service_name: "service",
      },
      type: "cloud_run_revision",
    },
    severity,
  },
});

describe("logger functions", () => {
  afterAll(() => {
    spyDebug.mockRestore();
    spyLog.mockRestore();
    spyInfo.mockRestore();
    spyWarn.mockRestore();
    spyError.mockRestore();
  });

  test("defaultLogger: all severity levels with strings", () => {
    const testString = "Test string";

    log(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("DEFAULT", testString)
    );

    debug(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("DEBUG", testString));

    info(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("INFO", testString));

    notice(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("NOTICE", testString)
    );

    warning(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("WARNING", testString)
    );

    error(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ERROR", testString));

    critical(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("CRITICAL", testString)
    );

    alert(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ALERT", testString));

    emergency(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("EMERGENCY", testString)
    );

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });

  test("defaultLogger: all severity levels with json", () => {
    const testJson = { a: "Foo", b: "Bar" };

    log(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("DEFAULT", testJson));

    debug(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("DEBUG", testJson));

    info(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("INFO", testJson));

    notice(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("NOTICE", testJson));

    warning(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("WARNING", testJson));

    error(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ERROR", testJson));

    critical(testJson);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("CRITICAL", testJson)
    );

    alert(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ALERT", testJson));

    emergency(testJson);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("EMERGENCY", testJson)
    );

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });

  test("custom instance: all severity levels with strings", () => {
    const customLogger = new UniversalGoogleLogger("test name 1");
    const testString = "Custom test string 1";

    customLogger.debug(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("DEBUG", testString));

    customLogger.info(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("INFO", testString));

    customLogger.notice(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("NOTICE", testString)
    );

    customLogger.warning(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("WARNING", testString)
    );

    customLogger.error(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ERROR", testString));

    customLogger.critical(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("CRITICAL", testString)
    );

    customLogger.alert(testString);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ALERT", testString));

    customLogger.emergency(testString);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("EMERGENCY", testString)
    );

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });

  test("custom instance: all severity levels with json", () => {
    const customLogger = new UniversalGoogleLogger("test name 2");
    const testJson = { a: "Foo 1", b: "Bar 1" };

    customLogger.debug(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("DEBUG", testJson));

    customLogger.info(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("INFO", testJson));

    customLogger.notice(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("NOTICE", testJson));

    customLogger.warning(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("WARNING", testJson));

    customLogger.error(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ERROR", testJson));

    customLogger.critical(testJson);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("CRITICAL", testJson)
    );

    customLogger.alert(testJson);
    expect(mockWrite).toHaveBeenCalledWith(expectedResult("ALERT", testJson));

    customLogger.emergency(testJson);
    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("EMERGENCY", testJson)
    );

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyLog).not.toHaveBeenCalled();
    expect(spyInfo).not.toHaveBeenCalled();
    expect(spyWarn).not.toHaveBeenCalled();
    expect(spyError).not.toHaveBeenCalled();
  });

  test("custom instance: with custom metadata", () => {
    const customLogger = new UniversalGoogleLogger("test name 2");
    const testJson = { a: "Foo 1", b: "Bar 1" };

    customLogger.debug(testJson, {
      labels: {
        foo: "bar",
        test: 123,
      },
    });

    const expectedMetadata = {
      labels: {
        foo: "bar",
        test: 123,
        node_app_version: "test_version",
      },
      resource: {
        labels: {
          configuration_name: "configuration",
          location: "us-central1",
          revision_name: "revision",
          service_name: "service",
        },
        type: "cloud_run_revision",
      },
      severity: "DEBUG",
    };

    // For some reason, toHaveBeenCalledWith() isn't validating the additional metadata fields,
    // so the this is validated manually against each call parameter
    expect(mockEntry.mock.lastCall[0]).toEqual(expectedMetadata);
    expect(mockEntry.mock.lastCall[1]).toEqual(testJson);
  });
});
