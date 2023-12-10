import mongoose from "mongoose";

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema({
    first_name: { type: String, required: [true, "Your name is required"] },
    last_name: { type: String, required: [true, "Your last name is required"] },
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Your email is required"],
    },
    password: {
      type: String,
      required: [true, "You have to create a password"],
    },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    status: { type: Boolean, default: true },
    dateCreaeted: { type: Date, default: Date.now },
  })
);

export default UserModel;
