import { MAILER_USER, MAILER_PASSWORD } from "../config/config.js";
import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: MAILER_USER,
    pass: MAILER_PASSWORD,
  },
});

export const sendMail = (recipient, subject, body) => {
  transport.sendMail({
    from: MAILER_USER,
    to: recipient,
    subject: subject,
    html: body,
  });
};
