import { calculateDiscount } from "../utils/discountCalculator";

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

export class Product {
  constructor(
    public readonly id: number,
    public title: string,
    private _price: number,
    public description: string,
    public category: string,
    public stock: number = 10,
    public image?: string,
    public rating?: number,
    public discountPercentage: number = 0
  ) {
    if (!Number.isFinite(_price) || _price < 0) throw new Error("Price must be a nonnegative number");
    if (!Number.isInteger(stock) || stock < 0) throw new Error("Stock must be a nonnegative integer");
  }

  get price(): number { return this._price; }
  set price(value: number) {
    if (!Number.isFinite(value) || value < 0) throw new Error("Price must be a nonnegative number");
    this._price = value;
  }

  getPriceWithDiscount(): number {
    return Math.round((this.price - calculateDiscount(this.price, this.discountPercentage) + Number.EPSILON) * 100) / 100;
  }

  displayDetails(): void {
    console.log("\n----- Product Details -----");
    console.log(`ID: ${this.id}`);
    console.log(`Name: ${this.title}`);
    console.log(`Description: ${this.description}`);
    console.log(`Category: ${this.category}`);
    console.log(`Price: $${this.price.toFixed(2)}`);
    console.log(`Discount: ${this.discountPercentage}%`);
    console.log(`Discount Amount: $${calculateDiscount(this.price, this.discountPercentage).toFixed(2)}`);
    console.log(`Price After Discount: $${this.getPriceWithDiscount().toFixed(2)}`);
    console.log(`Stock: ${this.stock}`);
    if (this.rating !== undefined) console.log(`Rating: ${this.rating}`);
    if (this.image) console.log(`Image: ${this.image}`);
    console.log("---------------------------");
  }

  static fromApi(data: ProductData): Product {
    if (!Number.isInteger(data.id) || typeof data.title !== "string" ||
        typeof data.description !== "string" || typeof data.category !== "string") {
      throw new Error("Invalid product data received");
    }
    return new Product(data.id, data.title, data.price, data.description, data.category, data.stock, data.thumbnail, data.rating, data.discountPercentage ?? 0);
  }
}
