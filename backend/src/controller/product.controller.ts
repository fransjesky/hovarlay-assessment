import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    // pagination query param
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const skip = (page - 1) * pageSize;

    // search and filter query param
    const q = req.query.q as string | undefined;
    const minPrice = (req.query.minPrice as string)
      ? parseFloat(req.query.minPrice as string)
      : undefined;
    const maxPrice = (req.query.maxPrice as string)
      ? parseFloat(req.query.maxPrice as string)
      : undefined;
    const inStock = req.query.inStock as string | undefined;
    const category = req.query.category;
    const categories = category
      ? Array.isArray(category)
        ? category.map((val) => parseInt(val as string))
        : [parseInt(category as string)]
      : undefined;

    const where = {
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      }),
      ...(inStock && {
        inStock: inStock === "true",
      }),
      ...(categories && {
        categories: {
          some: {
            id: { in: categories },
          },
        },
      }),
    };

    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
    });

    const total = await prisma.product.count({ where });

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
};

export const getProductById = async (req: Request, res: Response) => {
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
};
