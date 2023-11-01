import { Router } from "express";
import { productManager } from "../managers/productManager.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("home", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

router.get("/realTimeProducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

export default router;
