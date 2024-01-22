import UserModel from "../mongo/models/users.model.js";

export const getUserById = async (uid) => await UserModel.findById(uid);
export const getUserByEmail = async (email) =>
  await UserModel.findOne({ email });
export const registerUser = async (user) => await UserModel.create({ ...user });
