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
  purchaseCart,
} from "../controller/carts.controller.js";
import { current } from "../middlewares/current.middleware.js";

const router = Router();

router.get("/", getCarts);
router.get("/:cid", getCart);
router.get("/:cid/purchase", purchaseCart);

router.post("/", current("user"), createCart);
router.post("/:cid/products/:pid", current("user"), addProduct);

router.put("/:cid", current("user"), modifyCart);
router.put("/:cid/products/:pid", current("user"), putProductQuantity);

router.delete("/:cid/products/:pid", current("user"), deleteProduct);
router.delete("/:cid", current("user"), deleteCartProducts);

export default router;
