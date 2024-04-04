import { logger } from "../../utils/logger.js";
import UserModel from "../mongo/models/users.model.js";
import { sendMail } from "../../utils/transport.js";

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

export const deleteUser = async (uid) => {
  return await UserModel.findByIdAndDelete(uid);
};

export const deleteInactiveUsers = async () => {
  try {
    const twoDaysMilisenconds = 2 * 24 * 60 * 60 * 1000;
    const threshold = new Date(Date.now() - twoDaysMilisenconds);
    const inactiveUsers = await UserModel.find({
      last_connection: { $lt: threshold },
    });

    if (inactiveUsers.length > 0) {
      inactiveUsers.forEach(async (user) => {
        const email = user.email;
        sendMail(
          email,
          "ACCOUNT DELETED",
          `
          <h1 style="background:#93c5fd;text-align:center">CODEDOM</h1>
          <p>We are sending this email to inform you that your account has been deleted due to inactivity. 
          You can always register again <a href="https://backfinal-production-4974.up.railway.app/register" class="italic">clicking here</a>!</p>
          `
        );
      });

      const deletionResult = await UserModel.deleteMany({
        last_connection: { $lt: threshold },
      });

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
