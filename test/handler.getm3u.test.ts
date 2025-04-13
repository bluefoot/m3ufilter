import { handleGetm3u } from "../src/handler/getm3u";
import { Request, Response } from "express";
import {
  createRequest,
  createResponse,
  MockRequest,
  MockResponse,
} from "node-mocks-http";
import * as downloader from "../src/downloader";
import * as m3uparser from "../src/m3uparser";
import * as config from "../src/config";
jest.mock("../src/downloader");
jest.mock("../src/m3uparser");
jest.mock("../src/config");

describe("m3u handler", () => {
  let mockRequest: MockRequest<Request>;
  let mockResponse: MockResponse<Response>;
  let mockDownload;
  let mockFilterM3u;
  let mockLoadConfig;
  let downloadResponse;
  let filterM3uResponse;
  beforeEach(() => {
    ({ mockResponse, mockDownload, mockFilterM3u, mockLoadConfig } =
      createMocks());
    downloadResponse = mockServerDownloadResponse(mockDownload);
    filterM3uResponse = mockFilterM3uResponse(mockFilterM3u);
  });
  describe("when invoked", () => {
    it("if URL is present in query string, use it to download m3u file from server", async () => {
      const m3uUrl = "http://m3uprovider.com/get.php?id=1";

      await callGetm3uHandlerWithUrl(mockResponse, { url: m3uUrl });

      expect(mockDownload).toHaveBeenCalledWith({ url: m3uUrl });
    });

    it("if PROFILE is present in query string, load profile from config to get URL to download m3u file from server", async () => {
      const m3uUrl = "http://m3uprovider.com/get.php?id=3";
      const profileName = "tv";
      const mockConfigFile: config.ConfigFile = {
        profiles: [{ key: profileName, value: { url: m3uUrl } }],
      };
      mockLoadConfig.mockReturnValueOnce(mockConfigFile);

      await callGetm3uHandlerWithProfile(mockResponse, {
        profile: profileName,
      });

      expect(mockDownload).toHaveBeenCalledWith({ url: m3uUrl });
    });

    it("accepts filtered groups and excluded channels from URL", async () => {
      const m3uUrl = "http://m3uprovider.com/get.php?id=2";
      const groups = ["Group 1", "Group 2"];
      const exclude = ["Exclude 1", "Exclude 2"];

      await callGetm3uHandlerWithUrl(mockResponse, {
        url: m3uUrl,
        groups: groups,
        exclude: exclude,
      });

      expect(mockDownload).toHaveBeenCalledWith({
        url: m3uUrl,
      });
      expect(mockFilterM3u).toHaveBeenCalledWith({
        fileContents: downloadResponse.data,
        groupsToInclude: groups,
        channelsToExclude: exclude,
      });
    });

    it("accepts filtered groups and excluded channels from PROFILE", async () => {
      const profileName = "tv";
      const m3uUrl = "http://m3uprovider.com/get.php?id=4";
      const groups = ["Group 1", "Group 2"];
      const exclude = ["Exclude 1", "Exclude 2"];
      mockLoadConfigResponse(mockLoadConfig, {
        url: m3uUrl,
        profileName: profileName,
        groups: groups,
        exclude: exclude,
      });

      await callGetm3uHandlerWithProfile(mockResponse, {
        profile: profileName,
      });

      expect(mockDownload).toHaveBeenCalledWith({
        url: m3uUrl,
      });
      expect(mockFilterM3u).toHaveBeenCalledWith({
        fileContents: downloadResponse.data,
        groupsToInclude: groups,
        channelsToExclude: exclude,
      });
    });

    it("returns parsed m3u", async () => {
      const profileName = "tv";
      const m3uUrl = "http://m3uprovider.com/get.php?id=4";
      const groups = ["Group 1", "Group 2"];
      const exclude = ["Exclude 1", "Exclude 2"];
      mockLoadConfigResponse(mockLoadConfig, {
        url: m3uUrl,
        profileName: profileName,
        groups: groups,
        exclude: exclude,
      });

      await callGetm3uHandlerWithProfile(mockResponse, {
        profile: profileName,
      });

      expect(mockResponse._getData()).toBe(filterM3uResponse);
    });

    it("returns expected headers", async () => {
      const m3uUrl = "http://m3uprovider.com/get.php?id=2";

      await callGetm3uHandlerWithUrl(mockResponse, {
        url: m3uUrl,
      });

      assertResponseHeaders(mockResponse);
    });

    it("fails when both profile and url are set", async () => {
      const mockRequest: MockRequest<Request> = createRequest({
        method: "GET",
        url: `/getm3u?url=someurl&profile=someprofile`,
      });

      await expect(
        handleGetm3u({ req: mockRequest, res: mockResponse })
      ).rejects.toEqual(
        'Query params must include either "profile" or "url". Got both'
      );
    });

    it("fails when no profile and url are set", async () => {
      const mockRequest: MockRequest<Request> = createRequest({
        method: "GET",
        url: `/getm3u`,
      });

      await expect(
        handleGetm3u({ req: mockRequest, res: mockResponse })
      ).rejects.toEqual(
        'Query params must include either "profile" or "url". Got none'
      );
    });
  });
});

const createMocks = () => {
  const mockResponse = createResponse();
  const mockDownload = downloader.download as jest.MockedFunction<
    typeof downloader.download
  >;
  const mockFilterM3u = m3uparser.filterM3u as jest.MockedFunction<
    typeof m3uparser.filterM3u
  >;
  const mockLoadConfig = config.loadConfig as jest.MockedFunction<
    typeof config.loadConfig
  >;
  mockDownload.mockReset();
  mockFilterM3u.mockReset();
  mockLoadConfig.mockReset();
  return {
    mockResponse: mockResponse,
    mockDownload: mockDownload,
    mockFilterM3u: mockFilterM3u,
    mockLoadConfig: mockLoadConfig,
  };
};

const mockServerDownloadResponse = (mockDownload) => {
  const mockDownloadResponse: downloader.DownloadResponse = {
    data: "DataFile\nAnother Line",
    headers: { ...getMockedHeaders(), Connection: "test" },
  };
  mockDownload.mockResolvedValueOnce(mockDownloadResponse);
  return mockDownloadResponse;
};

const mockFilterM3uResponse = (mockFilterM3u) => {
  const mockParsedM3uFileContents = "FilteredResponse\nAnother Line";
  mockFilterM3u.mockReturnValueOnce(mockParsedM3uFileContents);
  return mockParsedM3uFileContents;
};

const mockLoadConfigResponse = (
  mockLoadConfig,
  options: { profileName; url; groups; exclude }
) => {
  const mockConfigFile: config.ConfigFile = {
    profiles: [
      {
        key: options.profileName,
        value: {
          url: options.url,
          channelsToExclude: options.exclude,
          groupsToInclude: options.groups,
        },
      },
    ],
  };
  mockLoadConfig.mockReturnValueOnce(mockConfigFile);
};

const callGetm3uHandlerWithUrl = async (
  mockResponse,
  queryString: { url: string; groups?: string[]; exclude?: string[] }
) => {
  const getParams = new URLSearchParams(
    queryString as unknown as Record<string, string>
  ).toString();
  const mockRequest: MockRequest<Request> = createRequest({
    method: "GET",
    url: `/getm3u?${getParams}`,
  });

  await handleGetm3u({ req: mockRequest, res: mockResponse });
};

const callGetm3uHandlerWithProfile = async (
  mockResponse,
  queryString: { profile: string }
) => {
  const mockRequest: MockRequest<Request> = createRequest({
    method: "GET",
    url: `/getm3u?profile=${encodeURIComponent(queryString.profile)}`,
  });

  await handleGetm3u({ req: mockRequest, res: mockResponse });
};

const getMockedHeaders = () => {
  return {
    "content-type": "text/html",
    "content-description": "desc",
    expires: "0",
    "cache-control": "no-cache",
    "content-disposition": 'attachment; filename="test.m3u"',
    "content-length": "29",
  };
};

const assertResponseHeaders = (actualResponse) => {
  const expectedHeaders = getMockedHeaders();
  const actualHeaders = actualResponse._getHeaders();
  for (const header of Object.keys(expectedHeaders)) {
    expect(actualHeaders[header]).toBe(expectedHeaders[header]);
  }
};
