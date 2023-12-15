import { Router } from "express";
import UserModel from "../dao/models/users.models.js";
import { initializePassport } from "../config/passport.config.js";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";
import passport from "passport";

const router = Router();

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  async (req, res) => {
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
    };

    return res.redirect("/");
  }
);

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/register",
    successRedirect: "/login",
  })
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Logout error");
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
});

export default router;
