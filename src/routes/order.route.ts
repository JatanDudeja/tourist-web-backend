import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { checkJWT } from "../middleware/user.middleware.js";

const router = Router();

const orderControllerInstance = new OrderController();

// Webhook Payment URL
router
  .route("/verifyPayment/webhook")
  .post(orderControllerInstance.createOrder.bind(orderControllerInstance));

// Get Order Details
router
  .route("/:orderID")
  .get(
    checkJWT,
    orderControllerInstance.getOrder.bind(orderControllerInstance)
  );

// Create Order API
router
  .route("/:orderID")
  .post(
    checkJWT,
    orderControllerInstance.createOrder.bind(orderControllerInstance)
  );

export default router;
