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
  public status: number;
  public errors: Record<string, string>;

  constructor(status: number, message: string, errors: Record<string, string> = {}) {
    const translatedMessage = translateError(message);
    const translatedErrors: Record<string, string> = {};
    
    Object.entries(errors).forEach(([key, val]) => {
      translatedErrors[key] = translateError(val);
    });

    super(translatedMessage);
    this.name = "ApiError";
    this.status = status;
    this.errors = translatedErrors;
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
      const errorData: ApiErrorResponse = await response.json();
      throw new ApiError(response.status, errorData.error, errorData.errors || {});
    }
    const text = (await response.text()).trim();
    throw new ApiError(response.status, text || response.statusText);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return undefined as T;
  }

  return response.json();
}
