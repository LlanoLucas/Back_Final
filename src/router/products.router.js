import { Router } from "express";
import { productManager } from "../managers/productManager.js";

const router = Router();
const products = await productManager.getProducts();

router.get("/products", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    if (!limit) res.send(products);
    else {
      const queryLimit = products.slice(0, limit);
      res.json(queryLimit);
    }
  } catch (err) {
    res
      .status(500)
      .send(
        `Ocurrió un error al realizar la petición de los productos\n\n${err}`
      );
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const pId = parseInt(req.params.pid);

    if (isNaN(pId)) {
      return res.status(400).send("Error: El ID solicitado es inválido");
    }

    const product = await productManager.getProductById(pId);

    if (!product) {
      res.status(400).send("El producto solicitado no existe");
    } else {
      res.send(product);
    }
  } catch (err) {
    res
      .status(500)
      .send(
        `Ocurrió un error al realizar la petición del producto... ( ${err})`
      );
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, price, thumbnail, code, category, stock } =
      req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const addProduct = await productManager.addProduct(
      title,
      description,
      price,
      thumbnail,
      code,
      category,
      stock,
      (status = true)
    );

    if (addProduct) {
      return res.status(201).json({
        message: `Producto (ID: ${addProduct.id}) añadido con éxito`,
        product: addProduct,
      });
    } else {
      return res.status(404).json({ error: "Error al agregar producto" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const { id, ...updated } = req.body;

    if (id && id !== productId) {
      return res
        .status(400)
        .json({ error: "No se puede modificar el ID del producto" });
    }

    const existingProduct = products.find((item) => item.id === productId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ error: `El producto (ID: ${productId}) no existe` });
    }

    await productManager.updateProduct(productId, updated);

    res.status(200).json({
      message: `El producto (ID: ${productId}) fue acutalizado correctamente!`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);

    // Busca el producto con el ID especificado
    const productoExistente = await products.find(
      (item) => item.id === productId
    );

    // Si el producto no existe, devuelve un error 404
    if (!productoExistente) {
      return res
        .status(404)
        .json({ error: `El producto con el ID ${productId} no existe` });
    }

    // Llama a productManager para eliminar el producto
    const productoEliminado = await productManager.deleteProduct(productId);
    console.log(productoEliminado); // Registra el producto eliminado (opcional)

    // Envía un mensaje de éxito cuando el producto se elimina con éxito
    res.status(200).json({
      message: `Producto con el ID ${productId} eliminado exitosamente`,
    });
  } catch (err) {
    // Maneja cualquier error inesperado
    res.status(500).json({ error: err.message });
  }
});

export default router;
