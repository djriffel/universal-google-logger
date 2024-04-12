import { fetchProjectId } from "./syncApi";
import { CloudRunFunctionMetadata, FirebaseFunctionMetadata } from "./types";

/**
 * Various config-related contants, from both google-provided env vars, as well as user-provided env vars.
 *
 * We start by populating all process.env fields into standalone vars, to ensure deterministic behavior
 * (eg: to prevent differing behavior in the event that a dotenv config call
 * is made after the first initialization of the logging).
 *
 * ref: https://firebase.google.com/docs/functions/config-env?gen=2nd#reserved-names
 */
export const LOGGER_NAME = process.env.LOGGER_NAME || "node-app";
export const LOG_TO_CONSOLE =
  (process.env.LOG_TO_CONSOLE || "").toLowerCase() === "true";
export const IS_FIREBASE_FUNCTION =
  !!process.env.K_REVISION || !!process.env.FUNCTION_NAME;

// process.env.FUNCTION_REGION was deprecated after Node 8-based firebase functions, but function deployments default to us-central1
export const FUNCTION_REGION = process.env.FUNCTION_REGION || "us-central1";
const SERVICE_NAME = process.env.K_SERVICE;
const FUNCTION_NAME = process.env.FUNCTION_NAME;
const CONFIGURATION_NAME = process.env.K_CONFIGURATION;
const REVISION_NAME = process.env.K_REVISION;
const TYPE = !!process.env.K_CONFIGURATION
  ? "cloud_run_revision"
  : "cloud_function";

export const deepCopy = (obj: object) => JSON.parse(JSON.stringify(obj));

/**
 * Return Function-specific metadata, including the fields
 * provided in the optional `baseMetadata` parameter.
 */
export const getFunctionMetadata = (
  customMetadata: any = {}
): CloudRunFunctionMetadata | FirebaseFunctionMetadata => {
  const metadata = deepCopy(customMetadata);

  metadata.resource = metadata.resource || {};
  metadata.resource.type = TYPE;
  metadata.resource.labels = metadata.resource.labels || {};

  if (TYPE === "cloud_run_revision") {
    metadata.resource.labels.service_name = SERVICE_NAME;
    metadata.resource.labels.location = FUNCTION_REGION;
    metadata.resource.labels.configuration_name = CONFIGURATION_NAME;
    metadata.resource.labels.revision_name = REVISION_NAME;
  } else {
    metadata.resource.labels.function_name = FUNCTION_NAME;
    metadata.resource.labels.region = FUNCTION_REGION;
  }

  return metadata;
};

export const PROJECT_STRING_ID = fetchProjectId();
