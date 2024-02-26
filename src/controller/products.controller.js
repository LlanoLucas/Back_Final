import ProductsModel from "../dao/mongo/models/products.model.js";
import mongoose from "mongoose";
import { ProductsRepository } from "../repositories/index.js";
import { logger } from "../utils/logger.js";

export const getProducts = async (req, res) => {
  try {
    const { limit = 3, page = 1, sort, query, places } = req.query;

    const sortOptions = sort ? { price: sort } : {};

    const options = {
      page,
      limit,
      lean: true,
      sort: sortOptions,
    };

    const queryConditions = {};
    if (query) {
      queryConditions.category = query.charAt(0).toUpperCase() + query.slice(1);
    }

    if (places && places === "true") queryConditions.stock = { $gt: 0 };

    const products = await ProductsModel.paginate(queryConditions, options);

    res.json({ status: "success", payload: products });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const pId = new mongoose.Types.ObjectId(req.params.pid);

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    let product = await ProductsRepository.getProduct(pId);

    if (!product) {
      logger.warning("Product not found");
    }
    res.json({ status: "success", payload: product });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `An error occurred while placing the product request... (${err})`,
    });
  }
};

export const addProduct = async (req, res) => {
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

  try {
    const productToAdd = {
      title: title,
      description: description,
      price: price,
      thumbnails: [thumbnails],
      code: code,
      category: category,
      stock: stock,
      status: status === "true",
    };

    const addedProduct = await ProductsRepository.addProduct(productToAdd);
    const user = req.user;

    if (!user)
      res.status(404).json({ status: "error", message: "user not defined" });

    user.role === "premium"
      ? (addedProduct.owner = user.email)
      : (addedProduct.owner = "admin");
    addedProduct.save();

    return res.status(201).json({
      message: `Product (ID: ${addedProduct._id}) successfully added`,
      product: addedProduct,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.pid);
    const { id, ...updated } = req.body;

    if (id && id !== productId) {
      return res.status(400).json({ error: "Cannot modify product ID" });
    }

    const updatedProduct = await ProductsRepository.updateProduct(
      productId,
      updated
    );

    res.status(200).json({
      message: `Product (ID: ${productId}) successfully updated!`,
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.pid);

    if (!mongoose.Types.ObjectId.isValid(req.params.pid)) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }

    const deletedProduct = await ProductsRepository.deleteProduct(productId);

    if (!deletedProduct) {
      res.status(404).json({
        status: "error",
        message: `Product (ID: ${productId}) not found`,
      });
      logger.warning(`Product (ID: ${productId}) not found`);
      return;
    }

    res.status(200).json({
      message: `Product (ID: ${productId}) successfully deleted`,
    });

    logger.info("Deleted product:", deletedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
