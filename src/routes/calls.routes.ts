import { Router } from "express";
import asyncHandler from "express-async-handler";
const router: Router = Router();
import { generateToken, makeCall } from "@controllers/call/call.controller";


router.get("/token/:chatId", asyncHandler(generateToken));
router.get("/call/:chatId", asyncHandler(makeCall));
export default router;




