import { Router } from "express";
import { TourController } from "../controllers/tour.controller.js";

const router = Router();

const tourInstance = new TourController();

router.route("/").post(tourInstance?.createTour.bind(tourInstance));

router.route("/all").get(tourInstance?.getAllTours.bind(tourInstance));

export default router;
