import jwt from "jsonwebtoken";

export const hasToken = (req, res, next) => {
  if (req.cookies.jwt) return next();
  res.redirect("/login");
};

export const auth = (req, res, next) => {
  if (!req.cookies.jwt) return next();
  res.redirect("/profile");
};

export const verifyJWT = (req, res, next) => {
  const jwtCookie = req.cookies.jwt;

  try {
    const decodedToken = jwt.verify(jwtCookie, process.env.JWT_SECRET);
    req.user = {
      sub: decodedToken.sub,
      ...decodedToken.user,
    };
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(401).json({ message: "Token verification failed" });
  }
};
