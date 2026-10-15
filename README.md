# SBA-6-TypeScript-and-Advanced-JavaScript
E-commerce Product Management System using TypeScript

# Reflection

### 1. How did you implement TypeScript features and OOP principles?
I used interfaces, classes, and type annotations to keep my code organized. Created a `Product` class with methods to display product details and calculate discounted prices.

### 2. What challenges did you encounter, and how did you overcome them?
My main challenges were handling API data, calculating discounts and taxes, and configuring TypeScript. I solved these by using interfaces, separate utility functions, and updating `tsconfig.json`.

### 3. How did you handle asynchronous operations and error management?
I used `async/await` and `fetch()` to retrieve products from DummyJSON. Also used `try/catch` and a custom `ApiError` class to handle failed requests and display helpful error messages.
