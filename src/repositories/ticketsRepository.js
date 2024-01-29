import { TicketsDao } from "../dao/index.js";

export const createTicket = async (ticket) =>
  await TicketsDao.createTicket({ ...ticket });
export const getTicketById = async (tid) => await TicketsDao.getTicketById(tid);
export const getTicketByEmail = async (email) =>
  await TicketsDao.getTicketByEmail({ purchaser: email });
