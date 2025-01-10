import { Router } from "express";
import { TourController } from "../controllers/tour.controller.js";

const router = Router();

const tourInstance = new TourController();

router.route("/").post(tourInstance?.createTour.bind(tourInstance));

export default router;
