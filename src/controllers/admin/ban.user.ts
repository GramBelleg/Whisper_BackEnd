import { Request, Response } from "express";
import { banUser } from "@services/admin/admin.service";
import { deleteAllUserTokens } from "@services/auth/prisma/delete.service";


