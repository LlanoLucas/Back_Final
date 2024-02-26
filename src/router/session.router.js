import { Router } from "express";
import passport from "passport";
import {
  login,
  logout,
  current,
  forgot,
  passwordReset,
} from "../controller/users.controller.js";
import { verifyJWT } from "../middlewares/jwt.middleware.js";

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

router.post("/forgot", forgot);

router.get("/reset-password", passwordReset);

router.get("/logout", logout);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  verifyJWT,
  current
);
export default router;
