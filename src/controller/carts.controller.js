import ProductsModel from "../dao/mongo/models/products.model.js";
import { CartsRepository } from "../repositories/index.js";

export const getCarts = async (req, res) => {
  try {
    const carts = await CartsRepository.getCarts();
    res.status(200).json({ message: "Success", payload: carts });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    res.status(200).json({ message: "Success", payload: { cart: cart } });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCart = async (req, res) => {
  try {
    const cartData = req.body;
    const newCart = await CartsRepository.createCart(cartData);
    res.json({
      status: "success",
      payload: newCart,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await ProductsModel.findById(pid);

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Invalid product" });
    }

    const cid = req.params.cid;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ status: "error", error: "Invalid cart" });
    }

    const cart = CartsRepository.addProduct(cid, pid);

    res.status(200).json({ status: "success", payload: result });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const modifyCart = async (req, res) => {
  try {
    const cid = req.params.cid;

    const cart = await CartsRepository.getCartById(cid);
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
};

export const putProductQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || !Number.isInteger(quantity))
      return res.status(404).json({
        msg: "Quantity is obligatory and must be an integer",
      });

    const cartExists = CartsRepository.getCart(cid);

    if (!cartExists)
      return res.status(404).json({ status: "error", error: "Cart not found" });

    const cart = await CartsRepository.putProductQuantity(cid, pid, quantity);

    if (!cart)
      return res.status(404).json({ msg: "Error to complete the action" });

    return res.json({ msg: "Producto actualizado en el carrito", carrito });

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = await CartsRepository.deleteProduct(cid, pid);

    if (!cart)
      return res.status(404).json({ msg: "Error to complete the action" });

    res.status(200).json({ status: "success", payload: updatedCart.products });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deleteCartProducts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cartExists = await CartsRepository.getCart(cid);

    if (!cartExists) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const cart = await CartsRepository.deleteCartProducts(cid);

    if (!cart)
      return res.status(404).json({ msg: "Error to complete the action" });

    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const purchaseCart = async (req, res) => {};
