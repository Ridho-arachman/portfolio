import axios from "axios";
import type {
  PaginatedResponse,
  PaginationParams,
} from "@/types/api";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Unknown error";
    return Promise.reject(new Error(message));
  },
);

export async function fetchPaginated<T>(
  url: string,
  params?: Partial<PaginationParams>,
): Promise<PaginatedResponse<T>> {
  const { data } = await apiClient.get<PaginatedResponse<T>>(url, {
    params: {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      ...(params?.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export async function fetchOne<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<{ data: T }>(url);
  return data.data;
}

export async function createOne<T>(url: string, payload: unknown): Promise<T> {
  const { data } = await apiClient.post<{ data: T }>(url, payload);
  return data.data;
}

export async function updateOne<T>(
  url: string,
  payload: unknown,
): Promise<T> {
  const { data } = await apiClient.put<{ data: T }>(url, payload);
  return data.data;
}

export async function deleteOne(url: string): Promise<void> {
  await apiClient.delete(url);
}
