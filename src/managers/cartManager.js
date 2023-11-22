import fs from "fs";

class CartManager {
  constructor(filename) {
    this.products = [];
    this.path = filename;
    this.format = "utf-8";
  }

  getCarts = async () => {
    try {
      return JSON.parse(await fs.promises.readFile(this.path, this.format));
    } catch (e) {
      console.log("ERROR: No se encontró el archivo");
      return [];
    }
  };

  getCartsById = async (id) => {
    const carts = await this.getCarts();
    return carts.find((cart) => cart.id === id);
  };

  generateId = async () => {
    const carts = await this.getCarts();
    return carts.length + 1;
  };

  addCart = async (products) => {
    const carts = await this.getCarts();
    const newCart = {
      id: await this.generateId(),
      products: products || [],
    };
    carts.push(newCart);
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
    this.carts = carts;
    return newCart;
  };

  addProductsToCart = async (cartId, productId) => {
    const carts = await this.getCarts();
    const cart = await this.getCartsById(cartId);

    if (!cart) return null;

    const existingProduct = cart.products.find(
      (item) => item.product === productId
    );

    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      const product = {
        product: productId,
        quantity: 1,
      };
      cart.products.push(product);
    }

    const cartIndex = carts.findIndex((item) => item.id === cartId);

    if (cartIndex !== -1) {
      carts[cartIndex] = cart;
    }

    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, "\t"));
    return cart;
  };
}

export const cartManager = new CartManager("src/dao/carts.json");
