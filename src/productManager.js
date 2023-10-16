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

  validateProduct = ({ title, code, description, thumbnail, stock }) => {
    if ((!title, !code, !description, !thumbnail, !stock)) {
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
    thumbnail,
    code,
    stock,
  }) => {
    const productToAdd = {
      id: this.generateId(),
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    if (!this.validateProduct(productToAdd)) {
      console.log("Datos inválidos\n");
    }

    this.products.push(productToAdd);

    try {
      await fs.promises.writeFile(this.path, JSON.stringify(this.products));
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

export const productManager = new ProductManager("data.json");

// const productToAdd = {
//   title: "producto prueba",
//   description: "Este es un producto prueba",
//   price: 100,
//   thumbnail: "Sin imagen",
//   code: "abc123",
//   stock: 11,
// };

// const productToAdd2 = {
//   title: "producto prueba 2",
//   description: "Este es el segundo producto prueba",
//   price: 200,
//   thumbnail: "Sin imagen",
//   code: "abc234",
//   stock: 22,
// };

// const productToAdd3 = {
//   title: "producto prueba 3",
//   description: "Este es el tercer producto prueba",
//   price: 300,
//   thumbnail: "Sin imagen",
//   code: "abc345",
//   stock: 33,
// };
// const productToAdd4 = {
//   title: "producto prueba 4",
//   description: "Este es el cuarto producto prueba",
//   price: 400,
//   thumbnail: "Sin imagen",
//   code: "abc456",
//   stock: 44,
// };
// const productToAdd5 = {
//   title: "producto prueba 5",
//   description: "Este es el quinto producto prueba",
//   price: 500,
//   thumbnail: "Sin imagen",
//   code: "abc567",
//   stock: 55,
// };
// const productToAdd6 = {
//   title: "producto prueba 6",
//   description: "Este es el sexto producto prueba",
//   price: 600,
//   thumbnail: "Sin imagen",
//   code: "abc678",
//   stock: 66,
// };
// const productToAdd7 = {
//   title: "producto prueba 7",
//   description: "Este es el séptimo producto prueba",
//   price: 700,
//   thumbnail: "Sin imagen",
//   code: "abc789",
//   stock: 77,
// };
// const productToAdd8 = {
//   title: "producto prueba 8",
//   description: "Este es el octavo producto prueba",
//   price: 800,
//   thumbnail: "Sin imagen",
//   code: "abc899",
//   stock: 88,
// };

// const productToAdd9 = {
//   title: "producto prueba 9",
//   description: "Este es el noveno producto prueba",
//   price: 900,
//   thumbnail: "Sin imagen",
//   code: "abc999",
//   stock: 99,
// };
// const productToAdd10 = {
//   title: "producto prueba 10",
//   description: "Este es el décimo producto prueba",
//   price: 1000,
//   thumbnail: "Sin imagen",
//   code: "abc100",
//   stock: 100,
// };

// await productManager.addProduct(productToAdd);
// await productManager.addProduct(productToAdd2);
// await productManager.addProduct(productToAdd3);
// await productManager.addProduct(productToAdd4);
// await productManager.addProduct(productToAdd5);
// await productManager.addProduct(productToAdd6);
// await productManager.addProduct(productToAdd7);
// await productManager.addProduct(productToAdd8);
// await productManager.addProduct(productToAdd9);
// await productManager.addProduct(productToAdd10);
