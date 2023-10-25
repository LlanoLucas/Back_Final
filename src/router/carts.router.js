import { Router } from "express";
import { cartManager } from "../managers/cartManager.js";

const router = Router();

// POST: Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const addCart = await cartManager.addCart();
    res.json({ mensaje: "Producto agregado al carrito", addCart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Agregar un producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    if (productId <= 0) {
      return res.status(404).json({ error: "Producto no válido" });
    }

    const cart = await cartManager.addProductsToCart(cartId, productId);

    if (!cart) {
      return res
        .status(404)
        .json({ error: `El carrito (ID ${cartId}) no existe` });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const cart = await cartManager.getCartsById(cartId);

    if (!cart) {
      return res
        .status(404)
        .json({ error: `El carrito (ID ${cartId}) no existe` });
    }

    res.status(200).send(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
