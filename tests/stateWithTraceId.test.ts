// Set cloud-run specific env vars before importing
process.env.K_SERVICE = "service";
process.env.K_REVISION = "revision";
process.env.K_CONFIGURATION = "configuration";

import {
  stateWithTraceFromCustomId,
  stateWithTraceFromHeaders,
  stateWithTraceFromRandomId,
} from "../src/traceUtils";

describe("state with traceId", () => {
  test("from custom string", () => {
    const state = stateWithTraceFromCustomId("testStateId");

    expect(state.get("trace")).toEqual(
      "projects/Mock MetaData Project ID/traces/testStateId"
    );
  });

  test("from random generated UUID", () => {
    const uuidTraceRegex =
      /projects\/Mock MetaData Project ID\/traces\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
    const state = stateWithTraceFromRandomId();

    expect(uuidTraceRegex.test(state.get("trace"))).toEqual(true);
  });

  test("from header string", () => {
    const headers = {
      "x-cloud-trace-context": "headerTraceId/23423423423;o=1",
    };
    const state = stateWithTraceFromHeaders(headers);

    expect(state.get("trace")).toEqual(
      "projects/Mock MetaData Project ID/traces/headerTraceId"
    );
  });

  test("from undefined header string", () => {
    const state = stateWithTraceFromHeaders({});

    expect(state.get("trace")).toEqual(
      "projects/Mock MetaData Project ID/traces/UNDEFINED_TRACE_HEADER"
    );
  });
});
