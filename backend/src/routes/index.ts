import { Router } from "express";
import authRoute from "./auth.routes.js";
import productsRoute from "./product.routes.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/products", productsRoute);

export default router;
