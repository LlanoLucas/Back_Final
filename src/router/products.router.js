import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controller/products.controller.js";
import { current } from "../middlewares/current.middleware.js";
import { verifyJWT } from "../middlewares/jwt.middleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProduct);

router.post("/", verifyJWT, current("admin", "premium"), addProduct);

router.put("/:pid", verifyJWT, current("admin", "premium"), updateProduct);

router.delete("/:pid", verifyJWT, current("admin"), deleteProduct);

export default router;
