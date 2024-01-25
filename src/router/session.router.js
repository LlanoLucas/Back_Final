import { Router } from "express";
import passport from "passport";
import { login, logout, current } from "../controller/users.controller.js";

const router = Router();

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  login
);

router.post(
  "/register",
  passport.authenticate("register", {
    session: false,
    failureRedirect: "/register",
    successRedirect: "/login",
  })
);

router.get("/logout", logout);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  current
);
export default router;
