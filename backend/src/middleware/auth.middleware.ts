import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "authentication required" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: "invalid or expired token" });
  }
};
