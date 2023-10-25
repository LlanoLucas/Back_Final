import fs from "fs";

class ProductManager {
  constructor(filename) {
    this.products = [];
    this.path = filename;
    this.format = "utf-8";
  }

  generateId = () => {
    const lastProductId =
      this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
    return lastProductId + 1;
  };

  validateProduct = ({ title, code, description, price, category, stock }) => {
    if ((!title, !code, !description, !category, !price, !stock)) {
      console.error("Todos los campos deben tener un valor\n");
      return false;
    }

    const isCodeRepeated = this.products.some((p) => p.code === code);

    if (isCodeRepeated) {
      console.error(
        `Error: Ya existe un producto con el código ${code} ingresado.\n`
      );
      return false;
    }

    return true;
  };

  addProduct = async ({
    title,
    description,
    price,
    category,
    thumbnails,
    code,
    stock,
    status,
  }) => {
    const productToAdd = {
      id: this.generateId(),
      title,
      description,
      price,
      category,
      thumbnails,
      code,
      stock,
      status,
    };

    if (!this.validateProduct(productToAdd)) {
      console.log("Datos inválidos\n");
    }

    this.products.push(productToAdd);

    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t")
      );
    } catch (error) {
      console.error("Error escribiendo el archivo:\n");
    }

    console.log(
      `Producto ${JSON.stringify(productToAdd.id)} agregado:\n ${JSON.stringify(
        productToAdd
      )}\n`
    );
    return productToAdd;
  };

  getProducts = async () => {
    try {
      const data = await fs.promises.readFile(this.path, this.format);
      console.log("Productos:\n", JSON.parse(data));
      console.log();
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.promises.writeFile(this.path, "[]");
        console.log(`Archivo "${this.path}" creado\n`);
        return [];
      } else {
        console.error("Error al leer el archivo:\n", err);
      }
    }
  };

  getProductById = async (id) => {
    const products = await this.getProducts();
    const product = products.find((p) => p.id === id);

    if (!product) throw new Error(`El producto ${id} no existe\n`);

    console.log(`Producto ${id} buscado:\n${JSON.stringify(product)}:\n`);
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
        console.log(
          `Producto ${id} editado:\n`,
          JSON.stringify(products[productIndex])
        );
        console.log();
      } else {
        throw new Error("No se encontró el producto\n");
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
        throw new Error(`El producto ${id} no se ha encontrado\n`);
      }

      products.splice(productIndex, 1);
      console.log(`Producto ${id} eliminado\n`);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
    } catch (error) {
      console.error(error.message);
    }
  };
}

export const productManager = new ProductManager("../api/products.json");
