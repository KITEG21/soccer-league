import { translateError } from "./error-translator";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.warn("VITE_API_URL is not defined in environment variables");
}

export interface ApiErrorResponse {
  error: string;
  errors?: Record<string, string>;
  code: number;
}

export class ApiError extends Error {
  public errors: Record<string, string> = {};

  constructor(public data: ApiErrorResponse) {
    super(translateError(data.error));
    this.name = "ApiError";

    if (data.errors) {
      Object.entries(data.errors).forEach(([field, msg]) => {
        this.errors[field] = translateError(msg);
      });
    }
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const errorData = await response.json();
      throw new ApiError(errorData);
    }
    const statusText = translateError(response.statusText);
    throw new Error(`Error API: ${response.status} ${statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  return response.json();
}
