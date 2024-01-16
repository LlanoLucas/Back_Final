import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  home,
  realTimeProducts,
  carts,
  chat,
  login,
  register,
  profile,
  callBack,
} from "../controller/views.controller.js";

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
  home
);

// Route to render real-time products
router.get(
  "/realTimeProducts",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  realTimeProducts
);

// Route to render carts
router.get("/carts/:cid", hasToken, verifyJWT, carts);

// Route to render the chat page
router.get("/chat", hasToken, verifyJWT, chat);

// Route to render the login page
router.get("/login", auth, login);

// Route to render the register page
router.get("/register", auth, register);

// Route to render the profile page
router.get(
  "/profile",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  profile
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
  callBack
);

export default router;
