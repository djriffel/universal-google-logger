process.env.LOG_TO_CONSOLE = "true";
// Set cloud-run specific env vars before importing
process.env.K_SERVICE = "service";
process.env.K_REVISION = "revision";
process.env.K_CONFIGURATION = "configuration";

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

const mockDebug = jest.spyOn(global.console, "debug").mockImplementation();
const mockLog = jest.spyOn(global.console, "log").mockImplementation();
const mockInfo = jest.spyOn(global.console, "info").mockImplementation();
const mockWarn = jest.spyOn(global.console, "warn").mockImplementation();
const mockError = jest.spyOn(global.console, "error").mockImplementation();

import {
  alert,
  critical,
  debug,
  emergency,
  error,
  info,
  notice,
  warning,
} from "../src";

describe("logger with console override", () => {
  afterAll(() => {
    mockDebug.mockRestore();
    mockLog.mockRestore();
    mockInfo.mockRestore();
    mockWarn.mockRestore();
    mockError.mockRestore();
  });

  test("all severity levels with strings", () => {
    const testString = "Test string";

    debug(testString);
    expect(mockDebug).toHaveBeenCalledWith(testString);

    info(testString);
    expect(mockInfo).toHaveBeenCalledWith(testString);

    notice(testString);
    expect(mockInfo).toHaveBeenCalledWith(testString);

    warning(testString);
    expect(mockWarn).toHaveBeenCalledWith(testString);

    error(testString);
    expect(mockError).toHaveBeenCalledWith(testString);

    critical(testString);
    expect(mockError).toHaveBeenCalledWith(testString);

    alert(testString);
    expect(mockWarn).toHaveBeenCalledWith(testString);

    emergency(testString);
    expect(mockError).toHaveBeenCalledWith(testString);

    expect(mockWrite).not.toHaveBeenCalled();
  });

  test("all severity levels with json", () => {
    const testJson = { a: "Foo", b: "Bar" };

    debug(testJson);
    expect(mockDebug).toHaveBeenCalledWith(testJson);

    info(testJson);
    expect(mockInfo).toHaveBeenCalledWith(testJson);

    notice(testJson);
    expect(mockInfo).toHaveBeenCalledWith(testJson);

    warning(testJson);
    expect(mockWarn).toHaveBeenCalledWith(testJson);

    error(testJson);
    expect(mockError).toHaveBeenCalledWith(testJson);

    critical(testJson);
    expect(mockError).toHaveBeenCalledWith(testJson);

    alert(testJson);
    expect(mockWarn).toHaveBeenCalledWith(testJson);

    emergency(testJson);
    expect(mockError).toHaveBeenCalledWith(testJson);

    expect(mockWrite).not.toHaveBeenCalled();
  });
});
