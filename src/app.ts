import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "@routes/index.routes";
import swaggerSpec from "./docs/swagger";
import swaggerUi from "swagger-ui-express";
import session from "express-session";
import cron from "node-cron";
import errorHandler from "@middlewares/error.handler";
import { initWebSocketServer } from "@socket/web.socket";
import { redisSubscribe } from "@src/redis/redis.sub.handlers";
import { deleteExpiredTokens } from "@services/auth/prisma/delete.service";
import { deleteExtraRelates } from "@services/user/prisma/delete.service";

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
app.use("/api", indexRouter);

initWebSocketServer(server);
redisSubscribe();

app.use(errorHandler);

cron.schedule("0 3 * * *", deleteExpiredTokens); // delete expired tokens every day at 3 AM
cron.schedule("0 3 * * *", () => deleteExtraRelates); // delete extra relates every day at 3 AM

// Comment this code in only testing to avoid EADDRINUSE error when running controllers tests which use the same port
server.listen(parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});

export default app;
