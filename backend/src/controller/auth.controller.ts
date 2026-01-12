import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.SECRET_KEY!,
      { expiresIn: "24h" },
    );

    res.json({
      message: "login successful",
      data: {
        id: user.id,
        email: user.email,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "login failed",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

export const logout = async (_: Request, res: Response) => {
  res.json({ message: "logout successful" });
};
