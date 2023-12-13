import { Router } from "express";
import UserModel from "../dao/models/users.models.js";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";

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

  if (user && isValidPassword(password, user.password)) {
    req.session.user = user;
    req.session.role = user.role;
    return res.redirect("/home");
  }

  return res.redirect("/");
});

router.post("/register", async (req, res) => {
  const data = req.body;
  try {
    data.password = createHash(data.password);

    const user = await UserModel.create({ ...data });

    if (user) {
      req.session.user = user;
      req.session.role = user.role;
      return res.redirect("/");
    }

    return res.redirect("/register");
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
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
});

export default router;
