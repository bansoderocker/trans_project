import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface AxiosResult<T> {
  loading: boolean;
  data: T | null;
  error?: string;
}

async function getAxios<T>(
  config: AxiosRequestConfig
): Promise<AxiosResult<T>> {
  let loading = true;
  let data: T | null = null;
  let error: string | undefined = undefined;

  console.log("Loading...");

  try {
    const response: AxiosResponse<T> = await axios.request<T>(config);
    data = response.data;
    console.log("Done.");
  } catch (err: unknown) {
    if (err instanceof Error) {
      error = err.message;
      console.error("Error:", error);
    } else {
      error = String(err);
      console.error("Unknown error:", error);
    }
  } finally {
    loading = false;
  }

  return {
    loading,
    data,
    error,
  };
}

export default getAxios;
