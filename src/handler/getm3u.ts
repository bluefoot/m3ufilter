import { download, DownloadResponse } from "../downloader";
import { filterM3u } from "../m3uparser";
import { ConfigFile, loadConfig } from "../config";
import { Request, Response } from "express";

interface GetM3uCommonArgs {
  groupsToInclude?: string[];
  channelsToExclude?: string[];
}

interface GetM3uUrlArgs extends GetM3uCommonArgs {
  url: string;
  profileKey?: never;
}

interface GetM3uConfigArgs extends GetM3uCommonArgs {
  profileKey: string;
  url?: never;
}

export type GetM3uArgs = GetM3uUrlArgs | GetM3uConfigArgs;

export const handleGetm3u = async (options: {
  req: Request;
  res: Response;
}) => {
  const args = parseRequestParams(options.req);
  const filterOptions = getFilterOptionsFromUrlOrConfig(args);
  const serverResponse = await download({ url: filterOptions.url });
  const filteredM3uFileContents = filterM3u({
    groupsToInclude: filterOptions.groupsToInclude,
    channelsToExclude: filterOptions.channelsToExclude,
    fileContents: serverResponse.data,
  });
  setHeaders(options.res, serverResponse, filteredM3uFileContents);
  options.res.send(filteredM3uFileContents);
};

const setHeaders = (
  res: Response,
  serverResponse: DownloadResponse,
  filteredM3uFileContents: string
) => {
  if (serverResponse.headers?.["content-type"]) {
    res.set("Content-Type", serverResponse.headers["content-type"]);
  }
  if (serverResponse.headers?.["content-description"]) {
    res.set("Content-Description", serverResponse.headers["content-description"]);
  }
  if (serverResponse.headers?.["expires"]) {
    res.set("Expires", serverResponse.headers["expires"]);
  }
  if (serverResponse.headers?.["cache-control"]) {
    res.set("Cache-Control", serverResponse.headers["cache-control"]);
  }
  if (serverResponse.headers?.["content-disposition"]) {
    res.set("Content-Disposition", serverResponse.headers["content-disposition"]);
  }
  res.set(
    "Content-Length",
    Buffer.byteLength(filteredM3uFileContents, "utf-8").toString()
  );
};

const parseRequestParams = (req: Request): GetM3uArgs => {
  if (req.query["url"] && req.query["profile"]) {
    throw `Query params must include either "profile" or "url". Got both`;
  }

  if (req.query["url"]) {
    return {
      url: req.query["url"].toString(),
      channelsToExclude: req.query["exclude"]?.toString().split(","),
      groupsToInclude: req.query["groups"]?.toString().split(","),
    };
  } else if (req.query["profile"]) {
    return { profileKey: req.query["profile"].toString() };
  } else {
    throw `Query params must include either "profile" or "url". Got none`;
  }
};

const getFilterOptionsFromUrlOrConfig = (args: GetM3uArgs) => {
  if (args.url) {
    return {
      channelsToExclude: args.channelsToExclude,
      groupsToInclude: args.groupsToInclude,
      url: args.url,
    };
  } else if (args.profileKey) {
    const config: ConfigFile = loadConfig();
    const profile = getConfigItem(args.profileKey, config);
    return {
      channelsToExclude: profile.channelsToExclude,
      groupsToInclude: profile.groupsToInclude,
      url: profile.url,
    };
  }
};

const getConfigItem = (profileKey: string, configFile: ConfigFile) => {
  const configItem = configFile.profiles.find(
    (profile) => profile.key === profileKey
  );
  if (!configItem) {
    throw `No profile named ${profileKey} found in config file ${configFile.filePath}`;
  }
  return configItem.value;
};
