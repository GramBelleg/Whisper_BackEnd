import { Router } from "express";
import asyncHandler from "express-async-handler";
import InitSSERequests from "@controllers/events/index.events";

const router: Router = Router();

router.route("/").get(asyncHandler(InitSSERequests));

export default router;
