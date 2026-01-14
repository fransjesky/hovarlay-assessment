import { Router } from "express";
import authRoute from "./auth.routes.js";
import productsRoute from "./product.routes.js";
import categoryRoute from "./category.routes.js";

const router = Router();

router.use("/auth", authRoute);
router.use("/products", productsRoute);
router.use("/categories", categoryRoute);

export default router;
