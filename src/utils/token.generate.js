import jwt from "jsonwebtoken";
import { logger } from "./logger.js";
import { JWT_SECRET } from "../config/config.js";

export const generateToken = (user, expires = "8hs") => {
  try {
    return jwt.sign({ ...user, expires: expires }, JWT_SECRET);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
