import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Product } from "./models/Product";
import { ApiService } from "./services/apiService";
import { calculateDiscount } from "./utils/discountCalculator";
import { calculateTax } from "./utils/taxCalculator";
import { getErrorMessage } from "./utils/errorHandler";

type CartItem = { product: Product; quantity: number };

class Store {
  private products: Product[] = [];
  private readonly api = new ApiService();
  private cart = new Map<number, CartItem>();

  async initialize(): Promise<void> {
    try {
      this.products = await this.api.getProducts();
      console.log(`
Loaded ${this.products.length} products from DummyJSON API.`);
    } catch (error) {
      console.log(`API unavailable (${getErrorMessage(error)}). Using demo products.`);
      this.products = [
        new Product(1, "Laptop Backpack", 49.99, "Durable everyday backpack", "accessories", 8),
        new Product(2, "Wireless Headphones", 89.99, "Bluetooth headphones", "electronics", 5),
        new Product(3, "Cotton T-Shirt", 19.99, "Comfortable casual shirt", "clothing", 15)
      ];
    }
  }

  listProducts(): void {
    console.log("\n----- Available Products -----");
    console.table(this.products.map(p => ({ ID: p.id, Product: p.title, Price: `$${p.price.toFixed(2)}`, SalePrice: `$${p.getPriceWithDiscount().toFixed(2)}`, Stock: p.stock, Rating: p.rating ?? "N/A", Discount: `${p.discountPercentage}%` })));
  }

  async search(keyword: string): Promise<void> {
    let matches: Product[];
    try {
      matches = await this.api.searchProducts(keyword);
    } catch {
      matches = this.products.filter(p => p.title.toLowerCase().includes(keyword.toLowerCase()));
      console.log("Search API unavailable; searching loaded products instead.");
    }
    if (!matches.length) { console.log("No matching products."); return; }
    console.log("\n----- Search Results -----");
    console.table(matches.map(p => ({ ID: p.id, Product: p.title, Price: `$${p.price.toFixed(2)}` })));
  }

  addToCart(id: number, quantity: number): void {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantity must be a positive integer");
    const existing = this.cart.get(id)?.quantity ?? 0;
    if (existing + quantity > product.stock) throw new Error(`Only ${product.stock - existing} more available`);
    this.cart.set(id, { product, quantity: existing + quantity });
    console.log(`Added ${quantity} x ${product.title}.`);
  }

  updateQuantity(id: number, quantity: number): void {
    const item = this.cart.get(id);
    if (!item) throw new Error("Product is not in your cart");
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > item.product.stock) throw new Error("Invalid quantity or insufficient stock");
    if (quantity === 0) this.cart.delete(id);
    else item.quantity = quantity;
    console.log("Cart updated.");
  }

  showProductDetails(id: number): void {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error("Product not found");
    product.displayDetails();
  }

  showCart(extraDiscountPercent = 0): void {
    if (this.cart.size === 0) { console.log("Your cart is empty."); return; }
    const items = [...this.cart.values()];
    console.log("\n----- Shopping Cart -----");
    console.table(items.map(({ product, quantity }) => ({
      Product: product.title,
      Category: product.category,
      Quantity: quantity,
      UnitSalePrice: `$${product.getPriceWithDiscount().toFixed(2)}`,
      LineTotal: `$${(product.getPriceWithDiscount() * quantity).toFixed(2)}`
    })));
    const subtotal = items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
    const productSavings = items.reduce((sum, { product, quantity }) => sum + calculateDiscount(product.price, product.discountPercentage) * quantity, 0);
    const saleSubtotal = items.reduce((sum, { product, quantity }) => sum + product.getPriceWithDiscount() * quantity, 0);
    const extraSavings = calculateDiscount(saleSubtotal, extraDiscountPercent);
    // Apply additional discount proportionally, then tax each product using its category.
    const multiplier = 1 - extraDiscountPercent / 100;
    const tax = items.reduce((sum, { product, quantity }) =>
      sum + calculateTax(product.getPriceWithDiscount() * quantity * multiplier, product.category), 0);
    const total = saleSubtotal - extraSavings + tax;
    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`Product discounts: -$${productSavings.toFixed(2)}`);
    console.log(`Extra discount (${extraDiscountPercent}%): -$${extraSavings.toFixed(2)}`);
    console.log(`Tax (groceries 3%; others 4.75%): $${tax.toFixed(2)}`);
    console.log(`Total: $${total.toFixed(2)}`);
    console.log("---------------------------");
  }

}

async function main(): Promise<void> {
  const store = new Store();
  const rl = createInterface({ input, output });
  try {
    await store.initialize();
    while (true) {
      console.log("\n===== E-Commerce Product Management =====");
      console.log("1. View All Products");
      console.log("2. Search Products");
      console.log("3. Add Product to Cart");
      console.log("4. Update or Remove Cart Item");
      console.log("5. View Shopping Cart");
      console.log("6. Apply Extra Discount");
      console.log("7. View Product Details");
      console.log("0. Exit\n");
      const choice = (await rl.question("Select an option: ")).trim();
      try {
        switch (choice) {
          case "1": store.listProducts(); break;
          case "2": await store.search(await rl.question("Search term: ")); break;
          case "3": {
            const id = Number(await rl.question("Product ID: "));
            const quantity = Number(await rl.question("Quantity: "));
            store.addToCart(id, quantity); break;
          }
          case "4": {
            const id = Number(await rl.question("Product ID: "));
            const quantity = Number(await rl.question("New quantity (0 to remove): "));
            store.updateQuantity(id, quantity); break;
          }
          case "5": store.showCart(); break;
          case "6": {
            const discount = Number(await rl.question("Discount percentage (0-100): "));
            store.showCart(discount); break;
          }
          case "7": store.showProductDetails(Number(await rl.question("Product ID: "))); break;
          case "0": console.log("Goodbye!"); return;
          default: console.log("Please choose a valid menu option.");
        }
      } catch (error) { console.log(`Error: ${getErrorMessage(error)}`); }
    }
  } finally { rl.close(); }
}

main().catch(error => { console.error(getErrorMessage(error)); process.exitCode = 1; });
