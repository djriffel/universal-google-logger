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

import { type Request, type Response } from "express";
import { attachContextWithTraceState, debug } from "../src";

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
    trace: "projects/Mock MetaData Project ID/traces/headerTraceId",
  },
});

const headers = () => ({
  "x-cloud-trace-context": "headerTraceId/23423423423;o=1",
});

describe("express middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      headers: headers(),
    };
    mockResponse = {
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("propagates trace ID in logs from request header", () => {
    attachContextWithTraceState({ rethrowExceptions: false })(
      mockRequest as Request,
      mockResponse as Response,
      () => {
        debug("Test log with trace ID");
      }
    );

    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("DEBUG", "Test log with trace ID")
    );
  });

  // Note: We only test the log/suppress exception path, as we cannot test the re-throw of exceptions
  // because at the outer layer the express middleware is not Promise-based
  // (testability of this may change when promise-based middleware comes in v5)
  test("catches and suppresses exceptions", () => {
    attachContextWithTraceState({ rethrowExceptions: false })(
      mockRequest as Request,
      mockResponse as Response,
      () => {
        throw new Error("Test error thrown");
      }
    );

    expect(mockWrite).toHaveBeenCalledWith(
      expectedResult("ALERT", new Error("Test error thrown"))
    );
  });
});
