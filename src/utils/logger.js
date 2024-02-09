import winston from "winston";
import { NODE_ENV } from "../config/config.js";

const customLevelLogs = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

const commonLoggerOptions = {
  levels: customLevelLogs,
  transports: [
    new winston.transports.Console({
      level: NODE_ENV === "development" ? "debug" : "info",
      format: winston.format.combine(
        winston.format.colorize({
          colors: {
            warning: "yellow",
            fatal: "red",
          },
        }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "./errors.log",
      level: "error",
      format: winston.format.json(),
    }),
  ],
};

export const logger = winston.createLogger(
  NODE_ENV === "production"
    ? commonLoggerOptions
    : {
        ...commonLoggerOptions,
        levels: customLevelLogs,
      }
);

export const addLogger = (req, res, next) => {
  req.logger = logger;
  next();
};
