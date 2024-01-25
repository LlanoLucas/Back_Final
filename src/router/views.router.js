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
import { hasToken, auth, verifyJWT } from "../middlewares/jwt.middleware.js";
import { current } from "../middlewares/current.middleware.js";
import { CartsRepository } from "../repositories/index.js";
import UserDTO from "../dto/users.dto.js";

const router = Router();

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
  current("admin"),
  realTimeProducts
);

router.get("/cart/:cid", hasToken, verifyJWT, carts);

router.get("/chat", hasToken, verifyJWT, current("user"), chat);

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
