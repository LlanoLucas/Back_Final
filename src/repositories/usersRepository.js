import { UsersDao } from "../dao/index.js";

export const getUserById = (uid) => UsersDao.getUserById(uid);
export const getUserByEmail = (email) => UsersDao.getUserByEmail(email);
export const registerUser = (user) => UsersDao.registerUser(user);
