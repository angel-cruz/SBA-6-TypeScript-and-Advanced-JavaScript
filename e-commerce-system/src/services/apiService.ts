import { Product, ProductData } from "../models/Product";
import { ApiError } from "../utils/errorHandler";

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

  async getProducts(): Promise<Product[]> {
    const data = await this.request<ProductResponse>(`${API_URL}?limit=0`);
    if (!Array.isArray(data.products)) throw new ApiError("Invalid products response");
    return data.products.map(item => Product.fromApi(item));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const data = await this.request<ProductResponse>(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    if (!Array.isArray(data.products)) throw new ApiError("Invalid search response");
    return data.products.map(item => Product.fromApi(item));
  }
}
