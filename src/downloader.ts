import axios from "axios";
export interface DownloadResponse {
  data: string;
  headers?: Record<string, string>;
}

export const download = async (options: {
  url: string;
}): Promise<DownloadResponse> => {
  const response = await axios.get(options.url, {
    headers: { Accept: "*/*", method: "get" },
  });
  return { data: response.data, headers: response.headers };
};
