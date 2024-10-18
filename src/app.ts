import express, { Express } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "@routes/index.routes";
import swaggerSpec from "./swagger";
import swaggerUi from "swagger-ui-express";
import session from "express-session";
import errorHandler from "@middlewares/error.handler";
import { initWebSocketServer } from "@socket/web.socket";
import { redisExpirySubscribe } from "@src/redis/redis.sub.handlers";

dotenv.config();

const app: Express = express();
const server = http.createServer(app);

app.use(
    cors({
        origin: function (origin, callback) {
            if (origin) {
                callback(null, origin); 
            } else {
                callback(null, "*"); 
            }
        },
        credentials: true, 
        optionsSuccessStatus: 200,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.JWT_SECRET as string, // Change this to your secret
        resave: false,
        saveUninitialized: true,
    })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", asyncHandler(indexRouter));

initWebSocketServer(server);
redisExpirySubscribe();

app.use(errorHandler);

server.listen(parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
