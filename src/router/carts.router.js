import { Router } from "express";
import {
  getCarts,
  getCart,
  createCart,
  addProduct,
  modifyCart,
  putProductQuantity,
  deleteProduct,
  deleteCartProducts,
} from "../controller/carts.controller.js";

const router = Router();

router.get("/", getCarts);
router.get("/:cid", getCart);

router.post("/", createCart);
router.post("/:cid/products/:pid", addProduct);

router.put("/:cid", modifyCart);
router.put("/:cid/products/:pid", putProductQuantity);

router.delete("/:cid/products/:pid", deleteProduct);
router.delete("/:cid", deleteCartProducts);

export default router;
