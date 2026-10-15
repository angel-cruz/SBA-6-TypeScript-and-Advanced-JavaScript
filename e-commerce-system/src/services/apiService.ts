const API_URL = "https://dummyjson.com/products";

interface ProductResponse {
  products: ProductData[];
  total: number;
  skip: number;
  limit: number;
}
export class ApiService {
  private async request<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new ApiError(`API returned HTTP ${response.status}`, response.status);
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Could not retrieve products: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
