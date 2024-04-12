export type CloudRunFunctionMetadata = {
  resource: {
    type: "cloud_run_revision";
    labels: {
      service_name: string;
      location: string;
      configuration_name: string;
      revision_name: string;
    };
  };
};

export type FirebaseFunctionMetadata = {
  resource: {
    type: "cloud_function";
    labels: {
      function_name: string;
      region: string;
    };
  };
};
