import express from "express";
import productsRouter from "./router/products.router.js";
import cartsRouter from "./router/carts.router.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(201).json({ message: "Server Running Successfully" });
});

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

const PORT = 8080;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
