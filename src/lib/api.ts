/**
 * Single place that talks to the API.
 *
 * The access token lives in memory plus sessionStorage rather than a cookie, so
 * the API stays stateless and there is no CSRF surface. A 401 clears the session
 * and bounces to sign-in instead of silently failing.
 */
import type {
  Category,
  ExportFile,
  HealthStatus,
  Job,
  JobOptions,
  Paged,
  Product,
  Site,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";
const TOKEN_KEY = "scrappy.token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export const token = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (value: string) => sessionStorage.setItem(TOKEN_KEY, value),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const jwt = token.get();
  if (jwt) headers.set("Authorization", `Bearer ${jwt}`);

  const response = await fetch(`${BASE}${path}`, { ...init, headers });

  if (response.status === 401) {
    token.clear();
    if (!location.pathname.startsWith("/sign-in")) location.assign("/sign-in");
    throw new ApiError("Your session expired. Sign in again.", 401);
  }
  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      /* response had no JSON body */
    }
    throw new ApiError(detail, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  signIn: (email: string, password: string) =>
    request<{ access_token: string; expires_in: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ id: string; email: string; is_admin: boolean }>("/auth/me"),

  /** Used to tell a slow crawl apart from "no worker is listening at all". */
  health: () => request<HealthStatus>("/health"),

  sites: () => request<Site[]>("/sites"),

  categories: (siteId: number) => request<Category[]>(`/categories?site_id=${siteId}`),

  createJob: (siteId: number, subcategoryIds: number[], options: JobOptions) =>
    request<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify({
        site_id: siteId,
        subcategory_ids: subcategoryIds,
        options,
      }),
    }),

  job: (id: string) => request<Job>(`/jobs/${id}`),

  jobs: (page = 1) => request<Paged<Job>>(`/jobs?page=${page}&page_size=20`),

  cancelJob: (id: string) => request<Job>(`/jobs/${id}/cancel`, { method: "POST" }),

  products: (jobId: string, page = 1, search = "") =>
    request<Paged<Product>>(
      `/jobs/${jobId}/products?page=${page}&page_size=50${
        search ? `&search=${encodeURIComponent(search)}` : ""
      }`,
    ),

  createExport: (jobId: string, fmt: "csv" | "xlsx") =>
    request<ExportFile>(`/jobs/${jobId}/exports?fmt=${fmt}`, { method: "POST" }),

  exports: (jobId: string) => request<ExportFile[]>(`/jobs/${jobId}/exports`),

  /** Downloads through fetch so the Authorization header travels with it. */
  download: async (jobId: string, file: ExportFile) => {
    const response = await fetch(
      `${BASE}/jobs/${jobId}/exports/${file.id}/download`,
      { headers: { Authorization: `Bearer ${token.get() ?? ""}` } },
    );
    if (!response.ok) throw new ApiError("That file is no longer available.", response.status);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.filename;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};