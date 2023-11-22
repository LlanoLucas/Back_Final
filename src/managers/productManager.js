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

    // Define un array de campos requeridos
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];

    // Verifica si ya existe un producto con el mismo código
    const isCodeRepeated = products.some((p) => p.code === code);

    if (isCodeRepeated) {
      return console.error(
        `Error: Ya existe un producto con el código ${code}.`
      );
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
      return console.error("Error: Todos los campos deben tener un valor.");
    }

    products.push(productToAdd);
    this.products = products;

    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, "\t")
      );
      // console.log(
      //   `Producto ${productToAdd.id} agregado: ${JSON.stringify(productToAdd)}`
      // );
      return productToAdd;
    } catch (error) {
      console.error("Error al escribir el archivo:\n", error);
      return null;
    }
  };

  getProducts = async () => {
    try {
      const data = await fs.promises.readFile(this.path, this.format);
      // console.log("Productos:\n", JSON.parse(data));
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.promises.writeFile(this.path, "[]");
        // console.log(`Archivo "${this.path}" creado\n`);
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

    // console.log(`Producto ${id} buscado:\n${JSON.stringify(product)}:\n`);
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
        // console.log(
        //   `Producto ${id} editado:\n`,
        //   JSON.stringify(products[productIndex])
        // );
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
      // console.log(`Producto ${id} eliminado\n`);
      this.products = products;

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
      return true;
    } catch (error) {
      console.error(error.message);
    }
  };
}

export const productManager = new ProductManager("src/dao/products.json");
