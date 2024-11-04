import { Request, Response } from "express";
import { addClient } from "@services/SSE/sse.service";

const InitSSERequests = (req: Request, res: Response) => {
    const userId = req.userId;
    addClient(userId, res);
};

export default InitSSERequests;
