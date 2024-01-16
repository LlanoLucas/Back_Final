import { Router } from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  modifyProduct,
  deleteProduct,
} from "../controller/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProduct);

//---------------------------------------------------------------------

router.post("/", addProduct);

//---------------------------------------------------------------------

router.put("/:pid", modifyProduct);

//---------------------------------------------------------------------

router.delete("/:pid", deleteProduct);

export default router;
