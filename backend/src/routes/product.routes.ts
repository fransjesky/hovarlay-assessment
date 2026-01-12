import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    const products = await prisma.product.findMany({
      skip,
      take: pageSize,
    });

    const total = await prisma.product.count();

    res.json({
      message: "fetch product data success",
      data: products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch products",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

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
        data: product,
      });
    }
    res.json({
      message: "fetch product data success",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch product",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
