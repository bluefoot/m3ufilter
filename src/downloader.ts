import axios from "axios";

export interface DownloadResponse {
  data: string;
  headers?: {
    "content-type"?: string;
    "content-description"?: string;
    "expires"?: string;
    "cache-control"?: string;
    "content-disposition"?: string;
  };
}

const setHeader = (headerName: keyof NonNullable<DownloadResponse['headers']>, axiosHeaders: any, response: DownloadResponse) => {
  if (axiosHeaders[headerName]) {
    response.headers[headerName] = axiosHeaders[headerName].toString();
  }
}

export const download = async (options: {
  url: string;
}): Promise<DownloadResponse> => {
  const m3uServerResponse = await axios.get(options.url, {
    headers: { Accept: "*/*", method: "get" },
  });
  const response: DownloadResponse = {
    data: m3uServerResponse.data, 
    headers: {}
  }
  setHeader("content-type", m3uServerResponse.headers, response);
  setHeader("content-description", m3uServerResponse.headers, response);
  setHeader("expires", m3uServerResponse.headers, response);
  setHeader("cache-control", m3uServerResponse.headers, response);
  setHeader("content-disposition", m3uServerResponse.headers, response);
  return response;
};
