import { Router } from "express";
import asyncHandler from "express-async-handler";
const router: Router = Router();
import { generateToken, makeCall, joinCall, leaveCall } from "@controllers/call/call.controller";
import { join } from "path";


//router.get("/token/:chatId", asyncHandler(generateToken));
router.get("/:chatId", asyncHandler(makeCall));
router.get("/join/:chatId", asyncHandler(joinCall));
router.get("/leave/:chatId/:callId/:endStatus", asyncHandler(leaveCall));

export default router;




