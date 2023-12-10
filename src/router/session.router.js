import { Router } from "express";
import UserModel from "../dao/models/users.models.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });

  if (user && user.password === password) {
    const userName = `${user.name} ${user.last_name}`;
    req.session.user = userName;
    req.session.role = user.role;
    return res.redirect("/home/profile");
  }

  if (!user) return res.status(404).send("User Not Found");

  return res.redirect("/home/login");
});

router.post("/register", async (req, res) => {
  const data = req.body;
  try {
    const user = await UserModel.create({ ...data });

    if (user) {
      const userName = `${user.name} ${user.last_name}`;
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

    return res.redirect("/");
  });
});

export default router;
