import jwt from "jsonwebtoken";

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
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

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
  const user = req.user.user;
  res.json({ status: "success", payload: user });
};
