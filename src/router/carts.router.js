import { Router } from "express";
import { cartManager } from "../managers/cartManager.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const nuevoCarrito = await cartManager.addCart();
    res.json({
      mensaje: "Producto agregado al carrito",
      carrito: nuevoCarrito,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:cid/producto/:pid", async (req, res) => {
  try {
    const idCarrito = parseInt(req.params.cid);
    const idProducto = parseInt(req.params.pid);

    if (idProducto <= 0) {
      return res.status(404).json({ error: "Producto no válido" });
    }

    const carrito = await cartManager.addProductsToCart(idCarrito, idProducto);

    if (!carrito) {
      return res
        .status(404)
        .json({ error: `El carrito con ID ${idCarrito} no existe` });
    }

    res.status(200).json(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const idCarrito = parseInt(req.params.cid);
    const carrito = await cartManager.getCartsById(idCarrito);

    if (!carrito) {
      return res
        .status(404)
        .json({ error: `El carrito con ID ${idCarrito} no existe` });
    }

    res.status(200).send(carrito);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
