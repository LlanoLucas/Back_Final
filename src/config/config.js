import dotenv from "dotenv";
dotenv.config();

export const MONGODB_URL = process.env.MONGODB_URL;
export const MONGODB_NAME = process.env.MONGODB_NAME;
export const ADMIN_MAIL = process.env.ADMIN_MAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const SESSION_KEY = process.env.SESSION_KEY;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CALLBACK_URL = process.env.CALLBACK_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const NODE_ENV = process.env.NODE_ENV;
export const MAILER_USER = process.env.MAILER_USER;
export const MAILER_PASSWORD = process.env.MAILER_PASSWORD;
