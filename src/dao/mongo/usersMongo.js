import { logger } from "../../utils/logger.js";
import UserModel from "../mongo/models/users.model.js";

export const getAllUsers = async (req, res) => {
  return await UserModel.find();
};
export const getUserById = async (uid) => {
  return await UserModel.findById(uid);
};
export const getUserByEmail = async (email) => {
  return await UserModel.findOne({ email });
};
export const registerUser = async (user) => {
  return await UserModel.create({ ...user });
};
export const deleteInactiveUsers = async () => {
  try {
    const twoDaysMilliseconds = 2 * 24 * 60 * 60 * 1000;
    const threshold = new Date(Date.now() - twoDaysMilliseconds);

    const deletionResult = await UserModel.deleteMany({
      last_connection: { $lt: threshold },
    });

    // Changed this block to include the 'deletedCount' property in the response object
    if (deletionResult.deletedCount > 0) {
      logger.info(`${deletionResult.deletedCount} inactive users deleted.`);
      return {
        status: "success",
        deletedCount: deletionResult.deletedCount,
        message: `${deletionResult.deletedCount} inactive users deleted.`,
      };
    } else {
      logger.info("No inactive users found.");
      return {
        status: "success",
        deletedCount: 0,
        message: "No inactive users found.",
      };
    }
  } catch (error) {
    logger.error("Error deleting inactive users:", error);
    return { status: "error", message: "Failed to delete inactive users." };
  }
};
