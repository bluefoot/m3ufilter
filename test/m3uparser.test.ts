import { filterM3u } from "../src/m3uparser";
import { readFileSync } from "fs";
import * as path from "path";

describe("m3uparser", () => {
  describe("when no group or channel name filters are specified", () => {
    it("should not filter groups and channels if option specified with no filters and no excluded channels", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
      });
      expect(actualFilteredM3u).toBe(m3uFileContents);
    });

    it("should not filter groups and channels if both options are empty", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        channelsToExclude: [],
        groupsToInclude: [],
      });
      expect(actualFilteredM3u).toBe(m3uFileContents);
    });
  });

  describe("when group filter names are specified", () => {
    it("should not filter out groups if filter groups option is specified but empty", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        groupsToInclude: [],
      });
      expect(actualFilteredM3u).toBe(m3uFileContents);
    });

    it("should return only filtered groups", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        groupsToInclude: [
          "Sport Package",
          "Entertainment & Reality",
          "NHL - National Hockey League",
        ],
      });
      const expectedFilteredM3uContents = loadResource(
        "m3uregular-filtered.m3u"
      );
      expect(actualFilteredM3u).toBe(expectedFilteredM3uContents);
    });

    it("should not return empty groups", async () => {
      const m3uFileContents = loadResource("m3uwithemptygroups.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        groupsToInclude: [
          "Sport Package",
          "Entertainment & Reality",
          "NHL - National Hockey League",
        ],
      });
      const expectedFilteredM3uContents = loadResource(
        "m3uwithemptygroups-filtered.m3u"
      );
      expect(actualFilteredM3u).toBe(expectedFilteredM3uContents);
    });
  });

  describe("when excluded keywords are specified", () => {
    it("should not filter out channels if exclude keywords option is specified but empty", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        channelsToExclude: [],
      });
      const expectedFilteredM3uContents = loadResource("m3uregular.m3u");
      expect(actualFilteredM3u).toBe(expectedFilteredM3uContents);
    });

    it("should not return channels with excluded keywords", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        channelsToExclude: ["ESPN", "MTV"],
      });
      const expectedFilteredM3uContents = loadResource(
        "m3uregular-excluded.m3u"
      );
      expect(actualFilteredM3u).toBe(expectedFilteredM3uContents);
    });
  });

  describe("when both filter groups and excluded keywords are specified", () => {
    it("should filter correctly", async () => {
      const m3uFileContents = loadResource("m3uregular.m3u");
      const actualFilteredM3u = filterM3u({
        fileContents: m3uFileContents,
        groupsToInclude: ["Sport Package", "Entertainment & Reality"],
        channelsToExclude: ["ESPN", "MTV"],
      });
      const expectedFilteredM3uContents = loadResource(
        "m3uregular-excluded-and-filtered.m3u"
      );
      expect(actualFilteredM3u).toBe(expectedFilteredM3uContents);
    });
  });
});

const loadResource = (name): string => {
  const resourcesDir = "resources";
  const fullFileName = path.resolve(__dirname, resourcesDir, name);
  return readFileSync(fullFileName, "utf-8");
};
