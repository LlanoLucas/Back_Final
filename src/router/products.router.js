import { Router } from "express";
import { productManager } from "../managers/productManager.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    if (!limit) {
      const products = await productManager.getProducts();
      res.json(products);
    } else {
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
      res.json(product);
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
    const {
      title,
      description,
      price,
      thumbnails,
      code,
      category,
      stock,
      status = true,
    } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: "Todos los campos son requeridos" });
    }

    const addProduct = await productManager.addProduct({
      title,
      description,
      price,
      thumbnails: [thumbnails], // Convert thumbnail to an array
      code,
      category,
      stock,
      status: status === "true", // Convert status to a boolean
    });

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

    const existingProduct = await productManager.getProductById(productId);

    if (!existingProduct) {
      return res
        .status(404)
        .json({ error: `El producto (ID: ${productId}) no existe` });
    }

    await productManager.updateProduct(productId, updated);

    res.status(200).json({
      message: `El producto (ID: ${productId}) fue actualizado correctamente!`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);

    // Llama a productManager para eliminar el producto
    const productoEliminado = await productManager.deleteProduct(productId);

    if (productoEliminado) {
      // Envía un mensaje de éxito cuando el producto se elimina con éxito
      res.status(200).json({
        message: `Producto con el ID ${productId} eliminado exitosamente`,
      });
    } else {
      // El producto no existía
      res
        .status(404)
        .json({ error: `El producto con el ID ${productId} no existe` });
    }
  } catch (err) {
    // Maneja cualquier error inesperado
    res.status(500).json({ error: err.message });
  }
});

export default router;
