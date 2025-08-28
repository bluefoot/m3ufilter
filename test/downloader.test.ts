import { download, DownloadResponse } from "../src/downloader";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("downloader", () => {
  describe("when invoked to download and all expected headers return from m3u server", () => {
    it("builds correct response", async () => {
      const mockAxiosResult = {
        data: "DataFile\nAnother Line",
        headers: { 
          "content-type": "text/html", 
          "content-disposition": 'inline; filename="example.m3u"', 
          "unused-header": "Hello", 
          "array-header": ["Val1", "Val2"],
          "expires": "Fri, 10 Jul 2026 05:00:00 GMT",
          "cache-control": "public, max-age=14400"
        },
        moreStuff: "something else",
        funct: () => "this",
      };
      mockedAxios.get.mockResolvedValueOnce(mockAxiosResult);
      const actualResult = await download({
        url: "http://testurl.com?m3ufile",
      });
      const expectedResult: DownloadResponse = {
        data: "DataFile\nAnother Line",
        headers: { 
          "content-type": "text/html", 
          "content-disposition": 'inline; filename="example.m3u"',
          "expires": "Fri, 10 Jul 2026 05:00:00 GMT",
          "cache-control": "public, max-age=14400"
        },
      };
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe("when invoked to download and not all expected headers return from m3u server", () => {
    it("builds correct response", async () => {
      const mockAxiosResult = {
        data: "DataFile\nAnother Line",
        headers: { 
          "content-type": "text/html", 
          "content-disposition": 'inline; filename="example.m3u"', 
          "cache-control": "public, max-age=14400"
        },
        moreStuff: "something else",
        funct: () => "this",
      };
      mockedAxios.get.mockResolvedValueOnce(mockAxiosResult);
      const actualResult = await download({
        url: "http://testurl.com?m3ufile",
      });
      const expectedResult: DownloadResponse = {
        data: "DataFile\nAnother Line",
        headers: { 
          "content-type": "text/html", 
          "content-disposition": 'inline; filename="example.m3u"',
          "cache-control": "public, max-age=14400"
        },
      };
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
