import { ErrorBody } from "@models/error.models";
import DuplicateUserError from "@src/errors/DuplicateUserError";
import { Request, Response, NextFunction } from "express";

export default function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.status ? err.status : 500;

    const body: ErrorBody = {
        success: false,
        message: err.message || "Something went wrong",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
    if (err instanceof DuplicateUserError) {
        body.duplicate = err.duplicate;
    }

    res.status(statusCode).json(body);
}
