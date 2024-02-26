import jwt from "jsonwebtoken";
import UserDTO from "../dto/users.dto.js";
import { UsersRepository } from "../repositories/index.js";
import { JWT_SECRET, NODE_ENV, MAILER_USER } from "../config/config.js";
import { sendMail } from "../utils/transport.js";
import { generateToken } from "../utils/token.generate.js";
import { logger } from "../utils/logger.js";
import { createHash } from "../utils/bcrypt.password.js";

export const login = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  const user = req.user.user;

  const token = jwt.sign(
    {
      sub: user._id,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        image: user.image,
        role: user.role,
        cart: user.cart,
      },
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
  });

  return res.redirect("/");
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    return res.redirect("/login");
  } catch (error) {
    return res.status(500).json({
      status: "server error",
      message: `An error ocurred when logging out\n\n${err}`,
    });
  }
};

export const current = (req, res) => {
  const user = new UserDTO(req.user.user);
  res.json({ status: "success", payload: user });
};

export const forgot = async (req, res) => {
  const { email } = req.body;
  const user = await UsersRepository.getUserByEmail(email);

  if (!user)
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });

  const token = generateToken(user, "1h");
  const link = `https://127.0.0.1:8080/api/session/reset-password?token=${token}`;

  sendMail(
    email,
    "PASSWORD RESET",
    `
    <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
  <p>Here is the link to reset your password:</p><br>
  <a href="${link}">127.0.0.1/api/session/reset-password?token=...</a><br>
  <p style="color:red">Remember that it will expire in 1 hour.</p>
  `
  );

  return res
    .status(200)
    .json({ status: "success", msg: "Email sent", payload: { email, token } });
};

export const passwordReset = async (req, res) => {
  try {
    const { token } = req.query;
    const { password } = req.body;
    const email = jwt.verify(token, JWT_SECRET);

    const user = UsersRepository.getUserByEmail(email);

    if (password === user.password)
      res.status(400).json({
        status: "error",
        msg: "The password must be different than the previous one",
      });

    user.password = createHash(password);
    user.save();
    return res
      .status(200)
      .json({ status: "success", msg: "Password succesfully reset" });
  } catch (error) {
    logger.error(error);
    res.status(error.statusCode).json({ status: "error", msg: error });
  }
};

export const userRole = async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await UsersRepository.getUserById(uid);
    const { role } = req.body;

    if (!user)
      return res.status(404).json({ status: "error", msg: "user not found" });
    if (!role)
      res.status(404).json({ status: "error", msg: "you must declare a role" });
    if (role === "admin")
      res.status(400).json({ status: "error", msg: "You cannot be an admin" });
    if (role === user.role)
      res.status(400).json({
        status: "error",
        msg: "Role must be diferent than the previous",
      });
    if (role != "user" && role != "premium")
      return res.status(400).json({
        status: "error",
        msg: "The only two options are 'user' or 'premium'",
      });

    user.role = role;
    user.save();

    res
      .status(200)
      .json({ status: "success", msg: "Role updated successfully!" });
  } catch (error) {
    res.status(400).json({ status: "error", msg: error.message });
  }
};
