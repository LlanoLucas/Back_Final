import { Router } from "express";
import UserModel from "../dao/models/users.models.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
    const user = {
      first_name: "Coder",
      last_name: "Admin",
      email: "adminCoder@coder.com",
      password: "adminCod3r123",
      role: "admin",
      status: true,
      dateCreated: new Date(),
    };
    req.session.user = user;
    req.session.role = user.role;
    return res.redirect("/home");
  }

  const user = await UserModel.findOne({ email });

  if (user && user.password === password) {
    req.session.user = user;
    req.session.role = user.role;
    return res.redirect("/home");
  }

  if (!user) return res.redirect("/home/login");
});

router.post("/register", async (req, res) => {
  const data = req.body;
  try {
    const user = await UserModel.create({ ...data });

    if (user) {
      req.session.user = user;
      req.session.role = user.role;
      return res.redirect("/");
    }

    return res.redirect("/home/register");
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: `Ocurrió un error al registrar al usuario... (${err})`,
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Logout error");

    return res.redirect("/home/login");
  });
});

export default router;
