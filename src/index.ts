import { google } from "@google-cloud/logging/build/protos/protos";
import { type RequestHandler } from "express";
import { UniversalGoogleLogger } from "./UniversalGoogleLogger";
import { LOGGER_NAME } from "./envConst";
import {
  loggerAsyncLocalStorage,
  stateWithTraceFromHeaders,
} from "./traceUtils";
import LogSeverity = google.logging.type.LogSeverity;

const defaultLogger = new UniversalGoogleLogger(LOGGER_NAME);
type MiddlewareParam = { rethrowExceptions: boolean };

/**
 * Helper function to wrap calls in order to log uncaught exceptions by using CommonGoogleLogger.
 * This will help retain trace state if needed.
 *
 * @param func Function to execute and catch+log any uncaught exceptions from
 * @param rethrow Whether to re-throw exceptions or not. Default: `false`
 * @param severity A google-cloud logging severity level to use. Default: `Severity.error`
 */
const exceptionLogger = async (
  func: () => void | (() => Promise<void>),
  rethrow = false,
  severity: LogSeverity = LogSeverity.ALERT
) => {
  try {
    await Promise.resolve(func());
  } catch (e) {
    await defaultLogger.logUsingSeverity(severity, e as any);

    if (rethrow) {
      throw e;
    }
  }
};

/**
 * Express middleware to attach AsyncLocalStorage context
 * that gets injected with Map() containing a "trace" field.
 *
 * This enables the "Show entries for this trace" functionality in Logs Explorer.
 */
const attachContextWithTraceState =
  ({ rethrowExceptions }: MiddlewareParam): RequestHandler =>
  (req, res, next) => {
    loggerAsyncLocalStorage.run(
      stateWithTraceFromHeaders(req.headers),
      async () => {
        await exceptionLogger(next, rethrowExceptions);
      }
    );
  };

const log = defaultLogger.log;
const debug = defaultLogger.debug;
const info = defaultLogger.info;
const notice = defaultLogger.notice;
const warning = defaultLogger.warning;
const error = defaultLogger.error;
const critical = defaultLogger.critical;
const alert = defaultLogger.alert;
const emergency = defaultLogger.emergency;

export {
  UniversalGoogleLogger,
  alert,
  attachContextWithTraceState,
  critical,
  debug,
  emergency,
  error,
  exceptionLogger,
  info,
  log,
  defaultLogger as logger,
  notice,
  warning,
};
