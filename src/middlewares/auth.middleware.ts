import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const userAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | null = null;
    console.log(req.cookies.token);
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    } else {
      throw new Error("Token is not found");
    }
    const id: number = (
      jwt.verify(token as string, process.env.JWT_SECRET as string) as Record<string, any>
    ).id;
    req.userId = id;
    next();
  } catch (e: any) {
    console.log(e.message);
    let message: string = e.message;
    if (e instanceof jwt.JsonWebTokenError) {
      message = "Expired Token. Login again";
    }
    res.status(401).json({
      status: "failed",
      message,
    });
  }
};

export default userAuth;
