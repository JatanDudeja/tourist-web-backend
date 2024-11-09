import express, { Request, Response } from "express";
import cors from "cors";
import UserRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(201).json({
    status: 201,
    message: "Hello, World!",
  });
});

app.use("/api/v1/users", UserRouter);

export default app;
