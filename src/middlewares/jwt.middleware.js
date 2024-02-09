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
  let jwtToken;

  const headerToken = req.header("Authorization");
  if (headerToken && headerToken.startsWith("Bearer ")) {
    jwtToken = headerToken.substring(7);
  }

  if (!jwtToken) {
    const jwtCookie = req.cookies.jwt;
    if (jwtCookie) {
      jwtToken = jwtCookie;
    }
  }

  try {
    if (jwtToken) {
      const decodedToken = jwt.verify(jwtToken, process.env.JWT_SECRET);
      req.user = {
        sub: decodedToken.sub,
        ...decodedToken.user,
      };
      next();
    } else {
      throw new Error("Token not found");
    }
  } catch (error) {
    logger.error("Token verification failed:", error.message);
    res.status(401).json({ message: "Token verification failed" });
  }
};
