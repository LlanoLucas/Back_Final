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

router.get("/", verifyJWT, current(["admin"]), getCarts);
router.get("/:cid", getCart);

router.post("/", verifyJWT, current(["user", "premium"]), createCart);
router.post(
  "/:cid/products/:pid",
  verifyJWT,
  current(["user", "premium"]),
  addProduct
);
router.get(
  "/:cid/purchase",
  verifyJWT,
  current(["user", "premium"]),
  purchaseCart
);

router.put("/:cid", verifyJWT, current(["user", "premium"]), modifyCart);
router.put(
  "/:cid/products/:pid",
  verifyJWT,
  current(["user", "premium"]),
  putProductQuantity
);

router.delete(
  "/:cid/products/:pid",
  verifyJWT,
  current(["user", "premium"]),
  deleteProduct
);
router.delete(
  "/:cid",
  verifyJWT,
  current(["user", "premium"]),
  deleteCartProducts
);

export default router;
