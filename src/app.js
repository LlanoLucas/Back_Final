import express from "express";
import { productManager } from "./productManager.js";

const app = express();

app.get("/products", async (req, res) => {
  try {
    const products = await productManager.getProducts();

    const limit = parseInt(req.query.limit);

    if (!limit) res.send(products);
    else {
      const queryLimit = products.slice(0, limit);
      res.json(queryLimit);
    }
  } catch (err) {
    res
      .status(500)
      .send(
        `Ocurrió un error al realizar la petición de los productos\n\n${err}`
      );
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const pId = parseInt(req.params.id);

    if (isNaN(pId)) {
      return res.status(400).send("ID Inválido");
    }

    const product = productManager.getProductById(pId);

    if (!product) res.status(400).send("El producto solicitado no existe");
    else {
      res.send(product);
    }
  } catch (err) {
    res
      .status(500)
      .send(
        `Ocurrió un error al realizar la petición del producto... ( ${err})`
      );
  }
});

app.listen(8080, () => {
  console.log(`Server corriendo en el puerto 8080...`);
});
