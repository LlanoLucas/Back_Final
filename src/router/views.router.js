import { Router } from "express";
import ProductsModel from "../dao/models/products.models.js";
import MessageModel from "../dao/models/messages.models.js";
import CartsModel from "../dao/models/carts.models.js";
import passport from "passport";

const router = Router();

function hasSession(req, res, next) {
  if (req.session?.user) return res.redirect("/profile");

  return next();
}

function auth(req, res, next) {
  if (req.session?.user) return next();

  res.redirect("/login");
}

router.get("/", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { limit = 3, page = 1, sort, query, places } = req.query;
  const user = req.session.user;

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
  try {
    const products = await ProductsModel.paginate(queryConditions, options);
    res.render("home", { products, sortQuery, queryQuery, queryPlaces, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

router.get("/realTimeProducts", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { query, sort } = req.query;

  try {
    const queryConditions = query
      ? { category: query.charAt(0).toUpperCase() + query.slice(1) }
      : {};

    const productsQuery = ProductsModel.find(queryConditions).lean();

    if (sort) {
      productsQuery.sort({ price: sort });
    }

    const products = await productsQuery.exec();
    res.render("realTimeProducts", { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

router.get("/carts/:cid", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    const cid = req.params.cid;

    const cart = await CartsModel.findOne({ _id: cid }).lean().exec();
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products.forEach((product) => {
      product.totalPrice = product.quantity * product.product.price;
    });

    const grandTotal = cart.products.reduce((total, product) => {
      return total + (product.totalPrice || 0); // Ensure product.totalPrice is defined
    }, 0);

    res.render("carts", { cart, grandTotal });
  } catch (error) {
    res.status(500).json({ error: "Error Interno del Servidor" });
  }
});

router.get("/chat", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  try {
    const messages = await MessageModel.find().lean().exec();
    res.render("chat", { messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/login", hasSession, (req, res) => {
  return res.render("login", {});
});

router.get("/register", hasSession, (req, res) => {
  return res.render("register", {});
});

router.get("/profile", auth, (req, res) => {
  const user = req.session.user;
  res.render("profile", { user });
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/register",
  }),
  async (req, res) => {
    if (!req.user) return res.redirect("/login");

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      image: req.user.image,
      role: req.user.role,
    };

    return res.redirect("/");
  }
);

export default router;
