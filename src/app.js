import { PORT } from "./utils.js";
import __dirname from "./utils.js";
import { Server } from "socket.io";
import { MONGODB_NAME, MONGODB_URL, SESSION_KEY } from "./config/config.js";

import express from "express";
import mongoose from "mongoose";
import handlebars from "express-handlebars";
import session from "express-session";
import passport from "passport";
import { initializePassport } from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import SwaggerUiExpress from "swagger-ui-express";
import { addLogger, logger } from "./utils/logger.js";

import MessageModel from "./dao/mongo/models/messages.model.js";
import productsRouter from "./router/products.router.js";
import cartsRouter from "./router/carts.router.js";
import sessionRouter from "./router/session.router.js";
import viewsRouter from "./router/views.router.js";
import usersRouter from "./router/users.router.js";

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(addLogger);
app.use(cookieParser());

app.use(
  session({
    secret: SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);

initializePassport();

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "CODEDOM Documentation",
      description: "The documentation for a courses platform 🧑‍🎓",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", SwaggerUiExpress.serve, SwaggerUiExpress.setup(specs));

app.use(passport.initialize());
app.use(passport.session());

app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/session", sessionRouter);
app.use("/api/users", usersRouter);

mongoose
  .connect(MONGODB_URL, { dbName: MONGODB_NAME })
  .then(() => {
    logger.info("DB connected");
    const httpServer = app.listen(PORT, () =>
      logger.info(`Listening on port ${PORT}...`)
    );

    const io = new Server(httpServer);
    app.set("socketio", io);

    io.on("connection", async (socket) => {
      logger.info("New client connected");

      socket.on("productList", (data) => {
        logger.info("Received 'productList' from client:", data);
        io.emit("updatedProducts", data);
      });

      let messages = (await MessageModel.find().exec()) || [];

      socket.broadcast.emit("alerta");
      socket.emit("logs", messages);

      socket.on("message", async (data) => {
        messages.push(data);
        await MessageModel.create(messages);
        io.emit("logs", messages);
      });
    });
  })
  .catch((e) => logger.error("Error connecting to the database:", e));
