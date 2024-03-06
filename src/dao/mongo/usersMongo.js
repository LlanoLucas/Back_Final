import UserModel from "../mongo/models/users.model.js";

export const getUserById = async (uid) => {
  return await UserModel.findById(uid);
};
export const getUserByEmail = async (email) => {
  return await UserModel.findOne({ email });
};
export const registerUser = async (user) => {
  return await UserModel.create({ ...user });
};
