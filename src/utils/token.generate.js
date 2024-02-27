import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import { JWT_SECRET } from "../config/config.js";

export const generateToken = (user, expires = "8h") => {
  try {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: expires });
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
