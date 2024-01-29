import mongoose from "mongoose";
import ProductsModel from "../dao/mongo/models/products.model.js";
import { CartsRepository, ProductsRepository } from "../repositories/index.js";
import { TicketsRepository } from "../repositories/index.js";

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
    console.log(pid);
    const product = await ProductsRepository.getProduct(pid);

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

    const cart = await CartsRepository.addProduct(cid, pid);

    res.status(200).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error addProduct", error: err.message });
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

    return res.status(200).json({ status: "success", payload: updatedProduct });
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

export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    if (cart.products.length === 0) {
      return res.status(404).json({ msg: "There are no products in the cart" });
    }

    const cartProducts = [];
    for (let i = 0; i < cart.products.length; i++) {
      console.log(cart.products[i].product._id);
      let productId = cart.products[i].product._id.toString();
      let quantity = cart.products[i].quantity;
      cartProducts.push([productId, quantity]);
    }

    const stockProducts = await Promise.all(
      cartProducts.map(async (array) => {
        let product = await ProductsRepository.getProduct(array[0]);
        let productId = product._id.toString();
        let stock = product.stock;
        return [productId, stock];
      })
    );

    const unBought = [];
    const boughtProducts = [];

    for (let i = 0; i < cartProducts.length; i++) {
      let enoughStock = stockProducts[i][1] - cartProducts[i][1];
      if (enoughStock < 0) {
        unBought.push(cartProducts[i][0], cartProducts[i][1]);
        continue;
      }

      boughtProducts.push([cartProducts[i][0], cartProducts[i][1]]);
      await ProductsRepository.updateProduct(stockProducts[i][0], {
        stock: enoughStock,
      });
    }

    let total = 0;

    for (const product of boughtProducts) {
      let productData = await ProductsRepository.getProduct(product[0]);
      total += productData.price * product[1];
    }

    const purchaser = req.user.email;

    if (boughtProducts.lentgh === 0) {
      return res.status(404).json({
        message: "Sorry, there is no stock available",
        failed: unBought,
      });
    }

    const ticket = await TicketsRepository.createTicket({
      amount: total,
      purchaser: purchaser,
    });

    if (unBought.length > 0) {
      await CartsRepository.deleteCartProducts(cid);
      for (const product of unBought) {
        await CartsRepository.addProduct(cid, product[0]);
      }

      return res.json({
        status: "success",
        message: "Successfull purchase",
        payload: ticket,
        bought: boughtProducts,
        unbought: unBought,
      });
    }

    await CartsRepository.deleteCart(cid);

    return res.json({
      status: "success",
      message: "Successfull purchase",
      payload: ticket,
      bought: boughtProducts,
    });
  } catch (error) {
    res.status(500).json({ status: "error purchase", error: error.message });
  }
};
