import fs from "fs";

class ProductManager {
  constructor(filename) {
    this.products = [];
    this.path = filename;
    this.format = "utf-8";
  }

  generateId = async () => {
    const products = await this.getProducts();

    const lastProductId =
      products.length > 0 ? products[products.length - 1].id : 0;

    const nextId = lastProductId + 1;

    return nextId;
  };

  addProduct = async ({
    title,
    description,
    price,
    category,
    thumbnails,
    code,
    stock,
  }) => {
    const products = await this.getProducts();

    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];

    const isCodeRepeated = products.some((p) => p.code === code);

    if (isCodeRepeated) {
      return logger.warning(`Product ${code} already exists`);
    }

    const productToAdd = {
      id: await this.generateId(),
      title,
      description,
      price,
      category,
      thumbnails: thumbnails || [],
      code,
      stock,
      status: true,
    };

    const haveEmptyValue = Object.values(productToAdd).some(
      (item) => item === ""
    );

    if (haveEmptyValue) {
      return logger.error("Every field has to be filled");
    }

    products.push(productToAdd);
    this.products = products;

    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t")
      );
      return productToAdd;
    } catch (error) {
      logger.error("Error writing file:\n", error);
      return null;
    }
  };

  getProducts = async () => {
    try {
      const data = await fs.promises.readFile(this.path, this.format);
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.promises.writeFile(this.path, "[]");
        return [];
      } else {
        logger.error("Error reading file:\n", err);
      }
    }
  };

  getProductById = async (id) => {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);

    if (!product) throw new Error(`Product ${id} does not exist\n`);

    return product;
  };

  updateProduct = async (id, updatedProduct) => {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          ...updatedProduct,
        };
        await fs.promises.writeFile(
          this.path,
          JSON.stringify(products, null, "\t")
        );
      } else {
        throw new Error("Product not found\n");
      }
    } catch (error) {
      return error;
    }
  };

  deleteProduct = async (id) => {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex === -1) {
        throw new Error(`Product ${id} not found\n`);
      }

      products.splice(productIndex, 1);
      this.products = products;

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
      return true;
    } catch (error) {
      logger.error(error.message);
    }
  };
}

export const productManager = new ProductManager("src/dao/products.json");
