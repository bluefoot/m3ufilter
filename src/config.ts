import * as path from "path";
import { readFileSync, existsSync } from "fs";

const CONTAINER_CONFIG_PATH = "/etc/m3ufilter";
const DEFAULT_CONFIG_FILE_NAME = "config.json";

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
  const configFilePath = options?.configFile || getDefaultConfigFile();
  if (existsSync(configFilePath)) {
    console.log(`Loading config file from: ${configFilePath}`);
    const fileContents = readFileSync(configFilePath, "utf-8");
    const parsedContents = JSON.parse(fileContents);
    parsedContents.filePath = configFilePath;
    return parsedContents;
  } else {
    console.log(`Config file does not exist: '${configFilePath}'. Fall back to no config.`);
    return {
      profiles: [],
    };
  }
};

const getDefaultConfigFile = () => path.join(getDefaultConfigFilePath(), DEFAULT_CONFIG_FILE_NAME);

const getDefaultConfigFilePath = () => {
  if (process.env.CONTAINER_ENV === 'docker') {
    return CONTAINER_CONFIG_PATH;
  }
  return getPlatformSpecificDefaultConfigFilePath();
};

const getPlatformSpecificDefaultConfigFilePath = () => {
  const userConfigDir =
    process.env.APPDATA ||
    (process.platform == "darwin"
      ? process.env.HOME + "/Library/Preferences"
      : process.env.HOME + "/.local/share");
  return path.join(userConfigDir, "m3ufilter");
};
