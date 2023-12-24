import mongoose from "mongoose";

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema({
    first_name: { type: String, required: [true, "Your name is required"] },
    last_name: { type: String },
    email: {
      type: String,
      unique: true,
      index: true,
      required: [true, "Your email is required"],
    },
    age: Number,
    password: {
      type: String,
      required: [true, "You have to create a password"],
    },
    image: {
      type: String,
      default: "https://static.thenounproject.com/png/5034901-200.png",
    },
    cart: mongoose.Schema.Types.ObjectId,
    role: { type: String, default: "user", enum: ["admin", "user"] },
    status: { type: Boolean, default: true },
    dateCreaeted: { type: Date, default: Date.now },
    github: { type: Boolean, default: false },
    google: { type: Boolean, default: false },
    meta: { type: Boolean, default: false },
  })
);

export default UserModel;
