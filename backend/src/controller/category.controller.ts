import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getCategories = async (_: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    res.json({
      message: "fetch categories success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch categories",
      error: error instanceof Error ? error.message : "unknown error occurred",
    });
  }
};
