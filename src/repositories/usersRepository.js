import { UsersDao } from "../dao/index.js";

export const getAllUsers = () => UsersDao.getAllUsers();
export const getUserById = (uid) => UsersDao.getUserById(uid);
export const getUserByEmail = (email) => UsersDao.getUserByEmail(email);
export const registerUser = (user) => UsersDao.registerUser(user);
export const deleteUser = (uid) => UsersDao.deleteUser(uid);
export const deleteInactiveUsers = () => UsersDao.deleteInactiveUsers();
