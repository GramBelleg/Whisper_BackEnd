import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import indexRouter from "@routes/index.routes";
import swaggerSpec from "./swagger";
import swaggerUi from "swagger-ui-express";
import session from "express-session";

dotenv.config();

const app: Express = express();

app.use(
    cors({
        credentials: true, // Allow cookies to be sent in cross-origin requests
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
app.use("/apis", indexRouter);


app.listen(parseInt(process.env.PORT as string), () => {
    console.log(`Listening on port ${process.env.PORT}`);
});

