export interface FilterOptions {
  groupsToInclude?: string[];
  channelsToExclude?: string[];
  fileContents: string;
}

export const filterM3u = (options?: FilterOptions): string => {
  return parseFileAsString(options);
};

const parseFileAsString = (options?: FilterOptions): string => {
  const nothingToDo =
    shouldAllGroupsBeReturned(options) && noChannelsToExclude(options);
  if (nothingToDo) {
    return options.fileContents;
  }
  const isExcludedLine = (line: string) => line.startsWith("#EXTM3U");
  const isMetadataLine = (line: string) => line.startsWith("#EXTINF");
  const fileContentLines = options.fileContents.split("\n");
  const output = ["#EXTM3U"];
  let currentGroup: string;
  for (let i = 0; i < fileContentLines.length; i++) {
    let line = fileContentLines[i].trim();
    try {
      if (isExcludedLine(line)) {
        continue;
      }
      let lineIsAMetadataLine = isMetadataLine(line);
      if (
        lineIsAMetadataLine &&
        shouldChannelBeExcluded(line, options?.channelsToExclude)
      ) {
        i++;
        continue;
      }
      if (lineIsAMetadataLine) {
        currentGroup = extractGroupName(line);
      }
      if (currentGroup === null) throw `Group null on line ${i}: ${line}`;
      if (shouldGroupBeIncluded(currentGroup, options?.groupsToInclude)) {
        output.push(line);
      }
    } catch (e) {
      throw `Error parsing line ${i}: '${e}'.\nLine: '${line}'.`;
    }
  }
  return convertToStringWithLineBreak(output);
};

const shouldAllGroupsBeReturned = (options?: FilterOptions) => {
  return !options?.groupsToInclude || options.groupsToInclude.length === 0;
};

const noChannelsToExclude = (options?: FilterOptions) => {
  return options?.channelsToExclude?.length === 0;
};

const shouldGroupBeIncluded = (group: string, channelsToInclude?: string[]) => {
  if (channelsToInclude === undefined || channelsToInclude.length === 0)
    return true;
  if (group === "") return false;
  return channelsToInclude.includes(group);
};

const shouldChannelBeExcluded = (
  line: string,
  excludedKeywords?: string[]
): boolean => {
  if (!excludedKeywords) return false;
  const channelName = extractParameterFromRegex(
    line,
    /^.*?tvg-name="(.*?)".*?$/g
  );
  return (
    channelName &&
    excludedKeywords.find((excludeKeyword) =>
      channelName.includes(excludeKeyword)
    ) != undefined
  );
};

const extractGroupName = (line: string) => {
  const groupTitle = extractParameterFromRegex(
    line,
    /^.*?group-title="(.*?)".*?$/g
  );
  if (groupTitle === undefined) {
    throw `No group-title match found for metadta line`;
  }
  return groupTitle;
};

const extractParameterFromRegex = (line: string, regexp: RegExp) => {
  const matches = line.matchAll(regexp);
  return matches.next()?.value?.[1];
};

const convertToStringWithLineBreak = (lines: string[]): string => {
  const linesAsString = lines.join("\n");
  return linesAsString.endsWith("\n")
    ? linesAsString
    : linesAsString.concat("\n");
};
