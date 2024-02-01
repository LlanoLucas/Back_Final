import mongoose from "mongoose";
import crypto from "crypto";

const ticketCollection = "tickets";

const ticketsSchema = new mongoose.Schema({
  code: {
    type: String,
    default: crypto.randomBytes(5).toString("hex"),
    required: true,
  },
  purchase_datetime: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  amount: { type: Number, required: [true, "The amount is required"] },
  purchaser: {
    type: String,
    required: [true, "The purchaser email is required"],
  },
});

const TicketsModel = mongoose.model(ticketCollection, ticketsSchema);

export default TicketsModel;
