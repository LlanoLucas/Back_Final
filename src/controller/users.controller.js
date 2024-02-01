import jwt from "jsonwebtoken";
import UserDTO from "../dto/users.dto.js";

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
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  console.log(user);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
