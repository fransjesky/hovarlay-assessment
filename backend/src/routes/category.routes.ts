import { Router } from "express";
import { getCategories } from "../controller/category.controller.js";

const router = Router();

router.get("/", getCategories);

export default router;
