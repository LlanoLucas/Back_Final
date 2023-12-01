import { Router } from "express";
import CartsModel from "../dao/models/carts.models.js";
import ProductsModel from "../dao/models/products.models.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const carts = await CartsModel.find().lean().exec();
    res.status(200).json(carts);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

//---------------------------------------------------------------------

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

//---------------------------------------------------------------------

router.post("/", async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await CartsModel.create(cartData);
    res.json({
      status: "success",
      payload: newCart,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

//----------------------------------------------------------------

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductsModel.findById(pid);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Invalid product" });
    }

    const cid = req.params.cid;
    const cart = await CartsModel.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Invalid cart" });
    }

    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );

    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    const result = await cart.save();
    res.status(200).json({ status: "success", payload: result });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

//---------------------------------------------------------------------

router.put("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;

    const cart = await CartsModel.findOne({ _id: cid });
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    const products = req.body;
    cart.products = products;
    await cart.save();

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

//---------------------------------------------------------------------

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await CartsModel.findOne({ _id: req.params.cid });

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (index) => index.product._id.toString() === req.params.pid.toString()
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ status: "error", error: "Product not found" });
    }

    const { quantity } = req.body;
    cart.products[productIndex].quantity = quantity;
    await cart.save();

    const updatedProduct = cart.products[productIndex];
    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

//---------------------------------------------------------------------

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const cart = await CartsModel.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (index) => index.product._id.toString() === productId.toString()
    );

    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    cart.products.splice(productIndex, 1);
    const updatedCart = await cart.save();

    res.status(200).json({ status: "success", payload: updatedCart.products });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

//---------------------------------------------------------------------

router.delete("/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    const updatedCart = await CartsModel.findOneAndUpdate(
      { _id: cid },
      { $set: { products: [] } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

export default router;
