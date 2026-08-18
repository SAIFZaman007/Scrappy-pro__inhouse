export interface Site {
  id: number;
  key: string;
  name: string;
  base_url: string;
  is_enabled: boolean;
  requests_per_second: number;
  concurrency: number;
  notes: string | null;
  mapped_subcategories: number;
}

export interface Subcategory {
  id: number;
  slug: string;
  name: string;
  is_mapped: boolean;
  is_verified: boolean;
  url_path: string | null;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  subcategories: Subcategory[];
}

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface JobEvent {
  at: string;
  level: string;
  message: string;
}

export interface Job {
  id: string;
  site_id: number;
  site_key: string | null;
  site_name: string | null;
  status: JobStatus;
  subcategory_ids: number[];
  options: Record<string, unknown>;
  total_units: number;
  completed_units: number;
  products_found: number;
  pages_fetched: number;
  progress_percent: number;
  current_step: string | null;
  error_message: string | null;
  events: JobEvent[];
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface Product {
  id: string;
  sequence: number;
  name: string;
  brand: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  price: string | null;
  old_price: string | null;
  stock: string | null;
  rating: number | null;
  reviews: number | null;
  badge: string | null;
  image: string | null;
  product_url: string;
}

export interface ExportFile {
  id: string;
  job_id: string;
  fmt: "csv" | "xlsx";
  filename: string;
  row_count: number;
  size_bytes: number;
  created_at: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface JobOptions {
  max_pages: number;
  fetch_details: boolean;
  detail_concurrency: number;
  id_prefix: string;
}
