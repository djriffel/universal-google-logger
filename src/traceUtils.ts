import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { PROJECT_STRING_ID } from "./envConst";

/**
 * Global instance for initializing calls with async context tracking.
 *
 * Usage pattern:
 * asyncLocalStorage.run(new Map(), () => {
 *     --context-enabled code here--
 * })
 */
export const loggerAsyncLocalStorage = new AsyncLocalStorage();

/**
 * Formats an arbitrary ID string into the structure used in a typical google log entry.
 */
const traceStringFromId = (traceId: string) =>
  `projects/${PROJECT_STRING_ID}/traces/${traceId}`;

export const stateWithTraceFromCustomId = (traceId: string) => {
  const stateMap = new Map();
  const trace = traceStringFromId(traceId);
  stateMap.set("trace", trace);

  return stateMap;
};

/**
 * Returns a new Map() to be used with the state parameter of AsyncLocalStorage.run()
 *
 * The header below is automatically populated when triggering a Firebase Function from an HTTP request.
 * (eg: when routing to functions from hosting rewrites)
 */
export const stateWithTraceFromHeaders = (
  reqHeaders: Record<string, string | string[] | undefined>
) => {
  // Format of header value: "{traceId}/{number};o=1"
  const traceId = reqHeaders["x-cloud-trace-context"]
    ? (reqHeaders["x-cloud-trace-context"] as string).split("/")[0]
    : "UNDEFINED_TRACE_HEADER";

  return stateWithTraceFromCustomId(traceId);
};

/**
 * Returns a new Map() to be used with the state parameter of AsyncLocalStorage.run()
 */
export const stateWithTraceFromRandomId = () => {
  return stateWithTraceFromCustomId(randomUUID());
};
