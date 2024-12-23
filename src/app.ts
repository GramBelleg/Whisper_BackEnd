import express, { Express } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "@routes/index.routes";
import session from "express-session";
import cron, { ScheduledTask } from "node-cron";
import errorHandler from "@middlewares/error.handler";
import { initWebSocketServer } from "@socket/web.socket";
import { redisSubscribe } from "@src/redis/redis.sub.handlers";
import { deleteExpiredTokens } from "@services/auth/prisma/delete.service";
import { deleteExtraRelates } from "@services/user/prisma/delete.service";
import redisClient from "./redis/redis.client";
import redisSubscriber from "./redis/redis.subscriber";
import { handleUnseenMessageNotification } from "@services/notifications/notification.service";

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
app.use("/api", indexRouter);

initWebSocketServer(server);
redisSubscribe();

app.use(errorHandler);

const deleteExpiredTokensTask: ScheduledTask = cron.schedule(
    "0 3 * * *",
    () => {
        deleteExpiredTokens();
    },
    {
        scheduled: true, 
        timezone: "Africa/Cairo"
    }
); // delete expired tokens every day at 3 AM
const deleteExtraRelatesTask: ScheduledTask = cron.schedule(
    "0 3 * * *",
    () => {
        deleteExtraRelates();
    },
    {
        scheduled: true, 
        timezone: "Africa/Cairo"
    }
); // delete extra relates every day at 3 AM
const handleUnseenNotificationsTask: ScheduledTask = cron.schedule(
    "0 18 * * *",
    () => {
        handleUnseenMessageNotification();
    },
    {
        scheduled: true, 
        timezone: "Africa/Cairo"
    }
);  // handle unseen notifications every day at 6 PM

deleteExpiredTokensTask.start();
deleteExtraRelatesTask.start();
handleUnseenNotificationsTask.start();

const closeApp = async () => {
    deleteExpiredTokensTask.stop();
    deleteExtraRelatesTask.stop();
    handleUnseenNotificationsTask.stop();

    if (redisClient.getInstance()) {
        await redisClient.quit();
    }

    if (redisSubscriber.getInstance()) {
        await redisSubscriber.quit();
    }
};

export { server, app, closeApp };
