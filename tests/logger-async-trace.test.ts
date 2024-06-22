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

import { UniversalGoogleLogger } from "../src";
import {
  loggerAsyncLocalStorage,
  stateWithTraceFromCustomId,
} from "../src/traceUtils";

describe("multiple async logger functions", () => {
  afterAll(() => {
    spyDebug.mockRestore();
    spyLog.mockRestore();
    spyInfo.mockRestore();
    spyWarn.mockRestore();
    spyError.mockRestore();
  });

  test("consistent async trace state", async () => {
    const customLogger = new UniversalGoogleLogger("async test name");
    const trace1 = "projects/Mock MetaData Project ID/traces/ID 1";
    const trace2 = "projects/Mock MetaData Project ID/traces/ID 2";

    type PromiseResolver = (value: void | PromiseLike<void>) => void;

    var task1PromiseResolve: PromiseResolver;
    const task1Promise = new Promise<void>((resolve) => {
      task1PromiseResolve = resolve;
    });

    var task2PromiseResolve: PromiseResolver;
    const task2Promise = new Promise<void>((resolve) => {
      task2PromiseResolve = resolve;
    });

    var allTasksPromiseResolve: PromiseResolver;
    const allTasksPromise = new Promise<void>((resolve) => {
      allTasksPromiseResolve = resolve;
    });

    loggerAsyncLocalStorage.run(
      stateWithTraceFromCustomId("ID 1"),
      async () => {
        customLogger.debug("Task 1, call 1");
        await task1Promise;
        customLogger.debug("Task 1, call 2");
        task2PromiseResolve();
      }
    );

    loggerAsyncLocalStorage.run(
      stateWithTraceFromCustomId("ID 2"),
      async () => {
        customLogger.debug("Task 2, call 1");
        task1PromiseResolve();
        await task2Promise;
        customLogger.debug("Task 2, call 2");
        allTasksPromiseResolve();
      }
    );

    const getMetadata = (trace: string) => ({
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
      severity: "DEBUG",
      trace,
    });

    await allTasksPromise;
    expect(mockEntry.mock.calls.length).toEqual(4);

    expect(mockEntry.mock.calls[0][0]).toEqual(getMetadata(trace1));
    expect(mockEntry.mock.calls[0][1]).toEqual("Task 1, call 1");

    expect(mockEntry.mock.calls[1][0]).toEqual(getMetadata(trace2));
    expect(mockEntry.mock.calls[1][1]).toEqual("Task 2, call 1");

    expect(mockEntry.mock.calls[2][0]).toEqual(getMetadata(trace1));
    expect(mockEntry.mock.calls[2][1]).toEqual("Task 1, call 2");

    expect(mockEntry.mock.calls[3][0]).toEqual(getMetadata(trace2));
    expect(mockEntry.mock.calls[3][1]).toEqual("Task 2, call 2");
  });
});
