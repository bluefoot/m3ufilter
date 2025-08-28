import { ConfigFile, loadConfig } from "../src/config";
import * as path from "path";

describe("config", () => {
  describe("when loading config file", () => {
    describe("when it contains a profile with no filters", () => {
      it("should load correctly", async () => {
        const testConfigFilePath = getTestConfigFilePath("configfile-profile-with-no-filters.json");
        const actualParsedConfig: ConfigFile = loadConfig({
          configFile: testConfigFilePath,
        });
        const expectedParsedConfig: ConfigFile = {
          filePath: testConfigFilePath,
          profiles: [
            {
              key: "full",
              value: {
                url: "http://url1",
              },
            },
          ],
        };
        expect(actualParsedConfig).toStrictEqual(expectedParsedConfig);
      });
    }),
    it("should load correctly if config file exists in user dir", async () => {
      const testConfigFilePath = getTestConfigFilePath();
      const actualConfig: ConfigFile = loadConfig({
        configFile: testConfigFilePath,
      });
      const expectedConfig: ConfigFile = {
        filePath: testConfigFilePath,
        profiles: [
          {
            key: "config1",
            value: {
              url: "http://url1",
              groupsToInclude: ["Sports", "Entertainment"],
              channelsToExclude: ["Soccer", "MLB"],
            },
          },
          {
            key: "config2",
            value: {
              url: "http://url2",
              groupsToInclude: ["Sports"],
            },
          },
          {
            key: "config3",
            value: {
              url: "http://url3",
              channelsToExclude: ["WWE"],
            },
          },
        ],
      };
      expect(actualConfig).toStrictEqual(expectedConfig);
    });

    it("should return empty config if config file doesn't exist", async () => {
      const actualConfig: ConfigFile = loadConfig({
        configFile: "/non-existing/config/file.json",
      });
      const expectedConfig: ConfigFile = {
        profiles: [],
      };
      expect(actualConfig).toStrictEqual(expectedConfig);
    });

    it("config.example.json validation test", async () => {
      const testConfigFilePath = path.resolve(
        __dirname,
        "../",
        "config.example.json"
      );
      const actualConfig: ConfigFile = loadConfig({
        configFile: testConfigFilePath,
      });
      const expectedConfig: ConfigFile = {
        filePath: testConfigFilePath,
        profiles: [
          {
            key: "config1",
            value: {
              url: "http://iptvserver.com/get.php?username=user&password=pwdH&type=m3u_plus&output=ts",
              groupsToInclude: ["Sports", "Entertainment", "Science"],
              channelsToExclude: ["Soccer", "MLB"],
            },
          },
          {
            key: "sportsonly",
            value: {
              url: "http://anotheriptvserver.com/get.php?username=user&password=pwdH&type=m3u_plus&output=ts",
              groupsToInclude: ["Sports"],
            },
          },
          {
            key: "full",
            value: {
              url: "http://myserver.com/get.php?pwd=pwd"
            },
          },
        ],
      };
      expect(actualConfig).toStrictEqual(expectedConfig);
    });
  });
});

const getTestConfigFilePath = (filename?: string): string => {
  const actualFile = filename || "configfilefortest.json";
  const resourcesDir = "resources";
  return path.resolve(__dirname, resourcesDir, actualFile);
};
