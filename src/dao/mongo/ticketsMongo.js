import TicketsModel from "./models/ticket.model.js";

export const createTicket = async (ticket) =>
  await TicketsModel.create({ ...ticket });
export const getTicketById = async (tid) => await TicketsModel.findById(tid);
export const getTicketByEmail = async (email) =>
  await TicketsModel.findOne({ purchaser: email });
