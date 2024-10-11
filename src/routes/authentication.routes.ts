import { Router } from "express";
import signup from "@controllers/signup.controller";

const router: Router = Router();

router.post("/signup", signup);

router.post("/login", signup);

router.get("/logout", signup);
export default router;
