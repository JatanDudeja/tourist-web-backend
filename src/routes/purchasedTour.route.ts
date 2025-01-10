import { Router } from "express";
import { PurchasedTourController } from "../controllers/purchasedTour.controller.js";

const router = Router();

const purchasedTourInstance = new PurchasedTourController();

router
  .route("/")
  .post(purchasedTourInstance?.createPurchasedTour.bind(purchasedTourInstance));

export default router;
