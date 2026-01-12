import { Router } from "express";
import { getProducts, getProductById } from "../controller/index.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProducts);

router.get("/:id", authenticate, getProductById);

export default router;
