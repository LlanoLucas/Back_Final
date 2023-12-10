import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import { PORT } from "./utils.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import productsRouter from "./router/products.router.js";
import cartsRouter from "./router/carts.router.js";
import sessionRouter from "./router/session.router.js";
import viewsRouter from "./router/views.router.js";
import MessageModel from "./dao/models/messages.models.js";

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoURL =
  "mongodb+srv://lll04:mycoderhouseproject@clusterbackend.eksdwt8.mongodb.net/";
const mongoDBName = "cluster_backend";

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: mongoURL,
      dbName: mongoDBName,
    }),
    secret: "s3cre3tK3y",
    resave: true,
    saveUninitialized: true,
  })
);

app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.get("/", (req, res) => {
  res.render("index", { name: "Juan" });
});

app.use("/home", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/session", sessionRouter);

mongoose
  .connect(mongoURL, { dbName: mongoDBName })
  .then(() => {
    console.log("DB connected");
    const httpServer = app.listen(PORT, () =>
      console.log(`Listening on port ${PORT}...`)
    );

    const io = new Server(httpServer);
    app.set("socketio", io);

    io.on("connection", async (socket) => {
      console.log("New client connected");

      socket.on("productList", (data) => {
        console.log("Received 'productList' from client:", data);
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
  .catch((e) => console.error("Error connecting to the database:", e));
