import { Router } from "express";
import { userRole } from "../controller/users.controller.js";

const router = Router();

router.post("/premium/:uid", userRole);

export default router;
