import * as path from "path";
import { readFileSync, existsSync } from "fs";

export interface ConfigFile {
  filePath?: string;
  profiles: {
    key: string;
    value: {
      url: string;
      groupsToInclude?: string[];
      channelsToExclude?: string[];
    };
  }[];
}

export const loadConfig = (options?: { configFile?: string }): ConfigFile => {
  const configFilePath = options?.configFile || getConfigFilePath();
  if (existsSync(configFilePath)) {
    console.log(`Loading config file from: ${configFilePath}`);
    const fileContents = readFileSync(configFilePath, "utf-8");
    const parsedContents = JSON.parse(fileContents);
    parsedContents.filePath = configFilePath;
    return parsedContents;
  } else {
    console.log(`Config file does not exist: ${configFilePath}`);
    return {
      profiles: [],
    };
  }
};

const getConfigFilePath = () => {
  const userConfigDir =
    process.env.APPDATA ||
    (process.platform == "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share");
  const baseConfigDir = path.join(userConfigDir, "m3ufilter");
  return path.join(baseConfigDir, "config.json");
};
