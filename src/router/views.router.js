import { Router } from "express";
import ProductsModel from "../dao/models/products.models.js";
import MessageModel from "../dao/models/messages.models.js";
import CartsModel from "../dao/models/carts.models.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware to check if a token is missing and redirect to login
function hasToken(req, res, next) {
  if (req.cookies.jwt) return next();
  res.redirect("/login");
}

function auth(req, res, next) {
  if (!req.cookies.jwt) return next();
  res.redirect("/profile");
}

// Middleware to verify and decode the JWT token
function verifyJWT(req, res, next) {
  const jwtCookie = req.cookies.jwt;

  try {
    const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET);
    req.user = {
      sub: decodedToken.sub,
      ...decodedToken.user,
    };
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ message: "Token verification failed" });
  }
}

// Route to render the home page
router.get(
  "/",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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

    try {
      const products = await ProductsModel.paginate(queryConditions, options);
      res.render("home", {
        products,
        sortQuery,
        queryQuery,
        queryPlaces,
        user: req.user.user,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route to render real-time products
router.get(
  "/realTimeProducts",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Route to render carts
router.get("/carts/:cid", hasToken, verifyJWT, async (req, res) => {
  try {
    // user = req.user;
    // const cartID = user.cart;
    const cid = req.params.cid;
    const cart = await CartsModel.findOne({ _id: cid }).lean().exec();

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
});

// Route to render the chat page
router.get("/chat", hasToken, verifyJWT, async (req, res) => {
  try {
    const messages = await MessageModel.find().lean().exec();
    res.render("chat", { messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Route to render the login page
router.get("/login", auth, (req, res) => {
  return res.render("login", {});
});

// Route to render the register page
router.get("/register", auth, (req, res) => {
  return res.render("register", {});
});

// Route to render the profile page
router.get(
  "/profile",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.render("profile", { user: req.user.user });
  }
);

// Route to authenticate with GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

// Route for GitHub callback
router.get(
  "/githubcallback",
  passport.authenticate("github", {
    failureRedirect: "/register",
  }),
  async (req, res) => {
    if (!req.user) return res.redirect("/login");

    const user = req.user;

    const token = jwt.sign(
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
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/");
  }
);

export default router;
