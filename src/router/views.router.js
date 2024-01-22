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
import { CartsRepository } from "../repositories/index.js";

const router = Router();

function hasToken(req, res, next) {
  if (req.cookies.jwt) return next();
  res.redirect("/login");
}

function auth(req, res, next) {
  if (!req.cookies.jwt) return next();
  res.redirect("/profile");
}

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

router.get(
  "/",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  home
);

router.get(
  "/realTimeProducts",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  realTimeProducts
);

router.get("/carts/:cid", hasToken, verifyJWT, carts);

router.get("/chat", hasToken, verifyJWT, chat);

router.get("/login", auth, login);

router.get("/register", auth, register);

router.get(
  "/profile",
  hasToken,
  passport.authenticate("jwt", { session: false }),
  profile
);

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
  callBack
);

export default router;
