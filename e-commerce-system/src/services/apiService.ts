const API_URL = "https://dummyjson.com/products";

interface ProductResponse {
  products: ProductData[];
  total: number;
  skip: number;
  limit: number;
}
