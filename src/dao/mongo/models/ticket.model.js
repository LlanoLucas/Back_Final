import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketsSchema = new mongoose.Schema({
  code: {
    type: String,
    default: (Math.random() + 1).toString(36).substring(5),
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
