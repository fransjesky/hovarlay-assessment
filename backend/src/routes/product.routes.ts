import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({
      message: "fetch product data success",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch products",
      error: error instanceof Error ? error.message : "Unknown error occured",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid product id",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, categories: true },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.json({
      message: "fetch product data success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error occured",
    });
  }
});

export default router;
