import { Router } from "express";
import { UsersController } from "../controllers/user.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const userInstance = new UsersController();

router.route("/createUser").post(userInstance?.createUser.bind(userInstance));
router.route("/login").post(userInstance?.userLogin.bind(userInstance));
router.route("/generateAccessToken").post(checkJWT, userInstance.getAccessToken.bind(userInstance))

export default router;
