import express, { Request, Response } from "express";
import cors from "cors";
import UserRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import StaticRouter from "./routes/static.route.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(201).json({
    status: 201,
    message: "Hello, World!",
  });
});

app.use("/api/v1/users", UserRouter);
app.use("/api/v1", StaticRouter);

export default app;
