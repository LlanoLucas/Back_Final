import jwt from "jsonwebtoken";
import UserDTO from "../dto/users.dto.js";
import { UsersRepository } from "../repositories/index.js";
import { JWT_SECRET, NODE_ENV, MAILER_USER } from "../config/config.js";
import { sendMail } from "../utils/transport.js";
import { generateToken } from "../utils/token.generate.js";
import { logger } from "../utils/logger.js";
import { createHash, isValidPassword } from "../utils/bcrypt.password.js";

export const login = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication failed" });
  }
  const user = req.user.user;

  const token = generateToken(
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
    "8h"
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
  });

  return res.redirect("/");
};

export const logout = async (req, res) => {
  try {
    const user = await UsersRepository.getUserById(req.user.sub);
    user.last_connection = new Date();
    user.save();
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
  let reqUser = req.user.user.user;
  const user = new UserDTO(reqUser);
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
  const link = `http://127.0.0.1:8080/reset-password?token=${token}`;

  sendMail(
    email,
    "PASSWORD RESET",
    `
    <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
  <p>Here is the link to reset your password:</p><br>
  <a href="${link}">http://127.0.0.1/api/session/reset-password?token=...</a><br>
  <p style="color:red">Remember that it will expire in 1 hour.</p>
  `
  );

  logger.info("Email sent");

  return res
    .status(200)
    .json({ status: "success", msg: "Email sent", payload: { email, link } });
};

export const passwordReset = async (req, res) => {
  try {
    const { token } = req.query;
    const { password, confirm } = req.body;
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const user = await UsersRepository.getUserByEmail(
      decodedToken.user.email ?? decodedToken._doc.email
    );

    if (!password)
      return res.status(401).json({ msg: "You must provide a new password" });
    if (!confirm)
      return res.status(401).json({ msg: "You must confirm your password" });
    if (password !== confirm)
      return res.status(401).json({ msg: "The passwords do not match" });

    if (isValidPassword(password, user.password)) {
      return res.status(400).json({
        status: "error",
        msg: "The password must be different than the previous password",
      });
    }

    user.password = createHash(password);
    user.save();

    sendMail(
      user.email,
      "PASSWORD SUCCESSFULLY RESET",
      `
    <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
  <h2>Your password has ben successfuly reset.</h2><br>
  <p>If it wasn't you, <a href="http://127.0.0.1:8080/forgot" class="italic">click here</a> to reset your password again.</p>
  `
    );

    logger.info("Password successfuly reset");

    return res.redirect("/login");
  } catch (error) {
    if (error.message === "jwt expired") return res.redirect("/forgot");
    return res.status(500).json({ status: "error", msg: error.message });
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

    if (role !== "user" && role !== "premium") {
      return res.status(400).json({
        status: "error",
        msg: "The only two options are 'user' or 'premium'",
      });
    }

    user.role = role;
    user.save();

    logger.info("Role updated successfully");

    return res
      .status(200)
      .json({ status: "success", msg: "Role updated successfully!" });
  } catch (error) {
    res.status(400).json({ status: "error", msg: error.message });
  }
};
