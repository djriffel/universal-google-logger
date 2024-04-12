/* istanbul ignore file */
import fetch from "sync-fetch";

/**
 * Get the current project ID first by trying known environment variables,
 * then by trying metadata server.
 * (metadata server works for compute, but not Firebase Functions)
 */
export const fetchProjectId = () => {
  const fromEnv =
    process.env.PROJECT_STRING_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT;

  if (fromEnv) {
    return fromEnv;
  }

  const resp = fetch(
    "http://metadata.google.internal/computeMetadata/v1/project/project-id",
    {
      headers: { "Metadata-Flavor": "Google" },
    }
  );
  return resp.text();
};
