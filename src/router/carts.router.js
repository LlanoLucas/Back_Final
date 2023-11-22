import { Router } from "express";
import CartsModel from "../dao/models/carts.models.js";
import ProductsModel from "../dao/models/products.models.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const cart = req.body;
    const addCart = await CartsModel.create(cart);
    res.json({
      status: "success",
      payload: addCart,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cId = req.params.cid;
    const pId = req.params.pid;

    const product = await ProductsModel.findById(pId);
    const cart = await CartsModel.findById(cId);

    if (!product) {
      return res.status(404).json({ error: "Invalid Product" });
    }

    if (!cart) {
      return res.status(404).json({ error: "Invalid Cart" });
    }

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === pId.toString()
    );

    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      const newProduct = {
        product: pId,
        quantity: 1,
      };
      cart.products.push(newProduct);
    }

    const result = await cart.save();

    res.status(200).json({ status: "success", payload: result });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cId = req.params.cid;
    const cart = await CartsModel.findById(cId);

    if (!cart) {
      return res.status(404).json({ error: `The cart ${cId} no existe` });
    }

    res.status(200).send(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const carts = await CartsModel.find().lean().exec();
    res.status(200).json(carts);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
