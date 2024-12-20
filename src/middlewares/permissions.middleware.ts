import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
        return res.status(401).json({
            status: "failed",
            message: "Unauthorized. You need to login.",
        });
    }
    if (req.userRole !== Role.Admin) {
        res.status(403).json({
            status: "failed",
            message: "Forbidden. You are not an admin.",
        });
    }
    next();
};