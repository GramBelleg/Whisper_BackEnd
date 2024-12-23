import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.userRole !== Role.Admin) {
        res.status(403).json({
            status: "failed",
            message: "Forbidden. You are not an admin.",
        });
    }
    next();
};

export default adminMiddleware;