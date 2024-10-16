import express, { Express } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "@routes/index.routes";
import swaggerSpec from "./swagger";
import swaggerUi from "swagger-ui-express";
import errorHandler from "@middlewares/error.handler";
import { initWebSocketServer } from "@socket/web.socket";
import { redisExpirySubscribe } from "@redis/redis.sub.handlers";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: "http://localhost:3000", // Allow this origin to send request to server and recieve response from server
        credentials: true, // Allow cookies to be sent in cross-origin requests
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", asyncHandler(indexRouter));

initWebSocketServer(server);
redisExpirySubscribe();

app.use(errorHandler);

server.listen(parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
