import express from "express";
import { PORT } from "./utils.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import productsRouter from "./router/products.router.js";
import cartsRouter from "./router/carts.router.js";
import viewsRouter from "./router/views.router.js";
import { Server } from "socket.io";

const app = express();
app.use(express.static(`${__dirname}/public`));
app.use(express.json());

const httpServer = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`New Client Connected`);
  socket.on("productList", (data) => {
    io.emit("updatedProducts", data);
  });
});

app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running successfully" });
});
