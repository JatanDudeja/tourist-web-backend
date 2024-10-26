import { Router } from "express";
import { UsersController } from "../controllers/user.controller.js";

const router = Router();

const userInstance = new UsersController();

router.route("/createUser").post(userInstance?.createUser.bind(userInstance));

export default router;
