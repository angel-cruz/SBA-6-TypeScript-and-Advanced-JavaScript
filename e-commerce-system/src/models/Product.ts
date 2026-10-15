export interface ProductData {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  thumbnail?: string;
  stock: number;
  rating?: number;
  discountPercentage?: number;
}
