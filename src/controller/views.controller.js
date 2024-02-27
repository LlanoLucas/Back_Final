import ProductsModel from "../dao/mongo/models/products.model.js";
import MessageModel from "../dao/mongo/models/messages.model.js";
import jwt from "jsonwebtoken";
import { CartsRepository, UsersRepository } from "../repositories/index.js";
import UserDTO from "../dto/users.dto.js";
import { logger } from "../utils/logger.js";
import { JWT_SECRET, NODE_ENV } from "../config/config.js";
import { generateToken } from "../utils/token.generate.js";

export const home = async (req, res) => {
  const { limit = 3, page = 1, sort, query, places } = req.query;

  const sortOptions = sort ? { price: sort } : {};
  const sortQuery = sort ? `&sort=${sort}` : "";
  const queryQuery = query ? `&query=${query}` : "";
  const queryPlaces = places === "true" ? `&places=true` : "";

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

  let user = req.user.user;

  if (user.sub !== undefined) user = req.user.user.user;

  if (!user.cart && user.role !== "admin") {
    const dbUser = await UsersRepository.getUserByEmail(user.email);
    user.cart = dbUser.cart.toString();
  }
  const products = await ProductsModel.paginate(queryConditions, options);

  const isAdmin = user.role === "admin";

  try {
    res.render("home", {
      products,
      sortQuery,
      queryQuery,
      queryPlaces,
      user,
      isAdmin,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const realTimeProducts = async (req, res) => {
  const { query, sort } = req.query;

  try {
    const queryConditions = query
      ? { category: query.charAt(0).toUpperCase() + query.slice(1) }
      : {};

    const productsQuery = ProductsModel.find(queryConditions).lean();

    if (sort) {
      productsQuery.sort({ price: sort });
    }

    const isAdmin = req.user.user.role === "admin";

    const products = await productsQuery.exec();
    res.render("realTimeProducts", { products, isAdmin });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const carts = async (req, res) => {
  try {
    const cid = req.params.cid;
    const cart = await CartsRepository.getCart(cid);

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products.forEach((product) => {
      product.totalPrice = product.quantity * product.product.price;
    });

    const grandTotal = cart.products.reduce((total, product) => {
      return total + (product.totalPrice || 0);
    }, 0);

    res.render("carts", { cart, grandTotal });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const chat = async (req, res) => {
  try {
    let user = req.user;
    if (user.sub !== undefined) user = req.user.user;
    console.log(user);
    const messages = await MessageModel.find().lean().exec();
    res.render("chat", { messages, user });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const login = (req, res) => {
  return res.render("login", {});
};

export const register = (req, res) => {
  return res.render("register", {});
};

export const profile = (req, res) => {
  let reqUser = req.user.user;
  if (reqUser.sub !== undefined) reqUser = req.user.user.user;
  const isAdmin = reqUser.role === "admin";
  const user = new UserDTO(reqUser);
  return res.render("profile", {
    user,
    isAdmin,
  });
};

export const callBack = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const user = req.user;

  const token = generateToken(
    {
      sub: user._id,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    },
    "1h"
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
  });

  return res.redirect("/");
};

export const navigation = async (req, res) => {
  let reqUser = req.user.user;
  if (reqUser.sub !== undefined) reqUser = req.user.user.user;
  const user = await UsersRepository.getUserByEmail(reqUser.email);
  const cart = user.cart;
  const isAdmin = user.role === "admin";
  res.render("navigation", { cart, isAdmin, user });
};

export const loggerTest = (req, res) => {
  req.logger.debug("This is a debug log test");
  req.logger.http("This is a http log test");
  req.logger.info("This is a info log test");
  req.logger.warning("This is a warn log test");
  req.logger.error("This is a error log test");
  req.logger.fatal("This is a fatal log test");

  const environment = NODE_ENV === "development";

  return res.render("loggerTest", { environment });
};

export const forgotpassword = (req, res) => {
  res.render("forgot");
};

export const resetPassword = (req, res) => {
  res.render("reset-password");
};
