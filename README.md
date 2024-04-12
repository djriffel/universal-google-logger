[![codecov](https://codecov.io/github/djriffel/universal-google-logger/graph/badge.svg?token=6P1LT9RYIN)](https://codecov.io/github/djriffel/universal-google-logger)

# Universal Google Logger

Use the same library to log across GCE VMs, Firebase Functions, etc.

Makes sharing common code across environments easier.

## Usage:

### Configuration

[View optional env configs](#environment-variable-configs-all-optional)

### Code

#### Usage with default logger instance:

```javascript
/**
 * Import method directly from default logger instance.
 *
 * Available methods:
 * log, debug, info, notice, warning, error, critical, alert, emergency
 *
 * You can also import the full default logger instance via the `logger` export.
 */
import { info } from "@driffel/universal-google-logger";

info("Text payload");
info({ someField: "JSON payload" });

// Use the second optional parameter to add custom metadata
info(
  { someField: "JSON payload" },
  { labels: { someLabel: "My custom label" } }
);
```

#### Usage with custom instance:

```javascript
import { UniversalGoogleLogger } from "@driffel/universal-google-logger";

const customLogger = new UniversalGoogleLogger("Custom logger name");

customLogger.info("Text payload");
customLogger.info({ someField: "JSON payload" });
```

#### Usage with trace-aware Express middleware:

```javascript
import { attachContextWithTraceState } from "@driffel/universal-google-logger";

/**
 * This injects the trace ID found in the Google-provided
 * `x-cloud-trace-context` HTTP header, which will then be automatically
 * included in every log entry's `trace` metadata field for that request.
 */
const app = express().use(
  attachContextWithTraceState({ rethrowExceptions: false })
);
```

### Advisory:

This library is not fully tested for all possible environment permutations. It is an MVP (minimum viable product) that has been tested under standard GCE VMs, as well as Firebase Functions (v2) configured under a Cloud Run-based deployment. It _should_ work in various other enviroments, but feedback as well as PR's are welcome (also feel free to inform if any configs, etc. are inaccurate; this is the culmination of a "best effort" in bringing together multiple info sources of varying age).

## Problem Statement:

When logging in Firebase/Google Cloud, you have three options, but none of them fulfill all requirements of propagating the correct metadata and log severity levels across environments. This makes developing for shared code across environments difficult when it comes to logging.

- **`console.log` / warn / error / etc...** \
  Propagates entries to Logs Explorer and sets the correct metadata fields for discovery using default filters from a function or VM, but does not properly embed the correct severity based on the console method called.

- **`@google-cloud/logging` library** \
  Generally considered the more modern and preferred approach to logging. Works well with handling metadata and severity level in GCE VM environments, but does not populate most of the metadata when in Firebase Function environments, making log discovery difficult.

- **`firebase-functions/logger` library** \
  Works well with all required metadata and appropriate severity levels, but only works for Firebase Functions.

## Solution:

This library wraps functionality of the `@google-cloud/logging` library and fills gaps in the metadata wherever available from google-provided environent variables or, if needed, the metadata server. It also propagates the correct severity levels, since it leverages google's logging library directly.

There are also helper functions for including the `trace` metadata field which enables the "Show entries for this trace" feature that groups entries in the Logs Explorer. This is done by leveraging [AsyncLocalStorage](https://nodejs.org/api/async_context.html#class-asynclocalstorage) to retain trace state through the call stack.

### Environment variable configs (all optional):

- `LOGGER_NAME`: Used to set a name for the default logger instance. Default value: "node-app".
- `PROJECT_STRING_ID`: Used to populate the `projectId` parameter of the Logging service in @google-cloud/logging library. This parameter is often provided through built-in env vars, or as a last resort from the metadata server (if using a GCE VM environment).
- `FUNCTION_REGION`: Used to populate the region/location field in Firebase Function logs. Default value: "us-central1".
- `LOG_TO_CONSOLE`: Set this to "true" to route logs to console.log instead of using google logging library. Useful for localhost/dev logging.

#### Note regarding `process.env` values:

To ensure deterministic behavior, all environment variables are loaded only once and then cached, upon first import, to prevent potentially inconsistent configuration due to something like a delayed dotenv config call.

#### Note regarding metadata server request:

A single **synchronous** (aka: blocking) API call, if necessary, is made in the very beginning upon file import. This is to load the project ID in the event that it's not provided by an expected environment variable (`PROJECT_STRING_ID`, `GCLOUD_PROJECT`, or `GOOGLE_CLOUD_PROJECT`).

Although blocking requests are typically considered poor practice, this was preferred to the complexity of guaranteeing the needed field is loaded asynchronously before it's first used. It should not cause any perfomance issues, as it only blocks a single time, in the very beginning on initial file import. This call can be entirely avoided as well, by manually populating the `PROJECT_STRING_ID` environment variable.
