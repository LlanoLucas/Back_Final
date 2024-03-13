import { Router } from "express";
import {
  deleteUsers,
  getAllUsers,
  userRole,
  deleteUser,
} from "../controller/users.controller.js";
import { verifyJWT } from "../middlewares/jwt.middleware.js";
import { current } from "../middlewares/current.middleware.js";

const router = Router();

router.post("/premium/:uid", verifyJWT, userRole);
router.get("/", verifyJWT, current(["admin"]), getAllUsers);
router.delete("/", verifyJWT, current(["admin"]), deleteUsers);
router.delete("/:uid", verifyJWT, current(["admin"]), deleteUser);
export default router;
