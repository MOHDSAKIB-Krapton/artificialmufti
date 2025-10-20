/**
 * Generic API response shape
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface BackendEnvelope<D> {
  success: boolean;
  data: D | null;
  error: any;
}
