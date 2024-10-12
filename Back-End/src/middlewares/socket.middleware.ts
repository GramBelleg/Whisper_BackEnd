import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export const cookieParse = (cookie: string, socket: Socket): number | undefined => {
  // Extract token from cookie
  try {
    const token: string | undefined = cookie
      .split(";")
      .find((c): c is string => c.trim().startsWith("token="));
    if (token) {
      const tokenValue = token.split("=")[1];
      const id: number = (
        jwt.verify(tokenValue as string, process.env.JWT_SECRET as string) as Record<string, any>
      ).id;
      return id;
    }
  } catch (err) {
    return;
  }
};
