import { download, DownloadResponse } from "../src/downloader";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("downloader", () => {
  describe("when invoked to download", () => {
    it("should call axios and get response", async () => {
      const mockAxiosResult = {
        data: "DataFile\nAnother Line",
        headers: { "Content-type:": "text/html", Length: "3332" },
        moreStuff: "something else",
        funct: () => "this",
      };
      mockedAxios.get.mockResolvedValueOnce(mockAxiosResult);
      const actualResult = await download({
        url: "http://testurl.com?m3ufile",
      });
      const expectedResult: DownloadResponse = {
        data: "DataFile\nAnother Line",
        headers: { "Content-type:": "text/html", Length: "3332" },
      };
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
