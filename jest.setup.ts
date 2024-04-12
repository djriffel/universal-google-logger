const syncApi = jest.requireActual("./src/syncApi");
jest
  .spyOn(syncApi, "fetchProjectId")
  .mockReturnValue("Mock MetaData Project ID");
