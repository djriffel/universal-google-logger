import { Log, Logging } from "@google-cloud/logging";
import { google } from "@google-cloud/logging/build/protos/protos";
import {
  IS_FIREBASE_FUNCTION,
  LOG_TO_CONSOLE,
  PROJECT_STRING_ID,
  deepCopy,
  getFunctionMetadata,
} from "./envConst";
import { loggerAsyncLocalStorage } from "./traceUtils";
import LogSeverity = google.logging.type.LogSeverity;

const logging = new Logging({ projectId: PROJECT_STRING_ID });

/**
 * DEFAULT	(0) The log entry has no assigned severity level.
 * DEBUG	(100) Debug or trace information.
 * INFO	(200) Routine information, such as ongoing status or performance.
 * NOTICE	(300) Normal but significant events, such as start up, shut down, or a configuration change.
 * WARNING	(400) Warning events might cause problems.
 * ERROR	(500) Error events are likely to cause problems.
 * CRITICAL	(600) Critical events cause more severe problems or outages.
 * ALERT	(700) A person must take an action immediately.
 * EMERGENCY	(800) One or more systems are unusable.
 *
 * ref: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
 */
const consoleMethods: Record<LogSeverity, (...args: any[]) => void> = {
  [LogSeverity.DEFAULT]: console.log,
  [LogSeverity.DEBUG]: console.debug,
  [LogSeverity.INFO]: console.info,
  [LogSeverity.NOTICE]: console.info,
  [LogSeverity.WARNING]: console.warn,
  [LogSeverity.ERROR]: console.error,
  [LogSeverity.CRITICAL]: console.error,
  [LogSeverity.ALERT]: console.warn,
  [LogSeverity.EMERGENCY]: console.error,
};

export class UniversalGoogleLogger {
  private logger: Log;

  constructor(name: string) {
    this.logger = logging.log(name);

    this.log = this.log.bind(this);
    this.debug = this.debug.bind(this);
    this.info = this.info.bind(this);
    this.notice = this.notice.bind(this);
    this.warning = this.warning.bind(this);
    this.error = this.error.bind(this);
    this.critical = this.critical.bind(this);
    this.alert = this.alert.bind(this);
    this.emergency = this.emergency.bind(this);
  }

  // Structure: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
  private getLogMetadata(
    severity: google.logging.type.LogSeverity,
    customMetadata: any = {}
  ) {
    let metadata = deepCopy(customMetadata);
    metadata.severity = LogSeverity[severity].toUpperCase();

    const store = loggerAsyncLocalStorage.getStore() as Map<string, any>;
    if (store) {
      metadata.trace = store.get("trace");
    }

    /**
     * Add any Firebase Function-related fields if we're running under a Function.
     * For GCE instances we don't need anything other than the severity, and the trace if desired;
     * everything else is automatically included in the log's metadata with GCE VMs.
     */
    if (IS_FIREBASE_FUNCTION) {
      metadata = getFunctionMetadata(metadata);
    }

    return metadata;
  }

  async logUsingSeverity(
    severity: google.logging.type.LogSeverity,
    data: string | {},
    customMetadata: any = {}
  ) {
    // Attach package.json `version` field to `node_app_version` metadata label
    if (!!process.env.npm_package_version) {
      if (!customMetadata.labels) {
        customMetadata.labels = {};
      }
      customMetadata.labels.node_app_version = process.env.npm_package_version;
    }

    const metadata = this.getLogMetadata(severity, customMetadata);
    const entry = this.logger.entry(metadata, data);
    entry.data.labels;

    if (LOG_TO_CONSOLE) {
      consoleMethods[severity](data);
    } else {
      await this.logger.write(entry);
    }
  }

  log(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.DEFAULT, data, customMetadata);
  }

  debug(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.DEBUG, data, customMetadata);
  }

  info(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.INFO, data, customMetadata);
  }

  notice(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.NOTICE, data, customMetadata);
  }

  warning(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.WARNING, data, customMetadata);
  }

  error(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.ERROR, data, customMetadata);
  }

  critical(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.CRITICAL, data, customMetadata);
  }

  alert(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.ALERT, data, customMetadata);
  }

  emergency(data: string | {}, customMetadata: any = {}) {
    return this.logUsingSeverity(LogSeverity.EMERGENCY, data, customMetadata);
  }
}
