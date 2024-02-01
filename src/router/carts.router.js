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
import { verifyJWT } from "../middlewares/jwt.middleware.js";

const router = Router();

router.get("/", getCarts);
router.get("/:cid", getCart);

router.post("/", verifyJWT, current("user"), createCart);
router.post("/:cid/products/:pid", verifyJWT, current("user"), addProduct);
router.get("/:cid/purchase", verifyJWT, current("user"), purchaseCart);

router.put("/:cid", verifyJWT, current("user"), modifyCart);
router.put(
  "/:cid/products/:pid",
  verifyJWT,
  current("user"),
  putProductQuantity
);

router.delete("/:cid/products/:pid", verifyJWT, current("user"), deleteProduct);
router.delete("/:cid", verifyJWT, current("user"), deleteCartProducts);

export default router;
