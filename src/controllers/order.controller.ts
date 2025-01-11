import { Request, Response } from "express";
import { createResponseObject } from "../utils/response.js";
import User from "../models/user.model.js";
import Tour from "../models/tour.model.js";
import {
  checkSignature,
  getRazorpayCreds,
  getRazorpayInstance,
} from "../utils/paymentGateway.js";
import Order from "../models/order.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import mongoose from "mongoose";
import PurchasedTour from "../models/purchasedTour.model.js";

export class OrderController {
  async createOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    const { tourID } = req.params || {};

    if (!userID) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    if (!tourID) {
      res.status(411).json(createResponseObject(411, "No tour id found"));
      return;
    }

    const userDetails = await User.findById(userID).select(
      "-password -refreshToken -createdAt, -updatedAt"
    );

    if (!userDetails) {
      res.status(401).json(createResponseObject(401, "Unauthorized Access"));
      return;
    }

    const tourDetails = await Tour.findById(tourID);

    if (!tourDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "The tour is no longer available"));
      return;
    }

    const razorpayInstance = getRazorpayInstance();

    if (!razorpayInstance) {
      res
        .status(422)
        .json(
          createResponseObject(
            422,
            "Our payment partner is currently facing issues we will be back soon"
          )
        );
    }

    let newOrder;

    try {
      newOrder = await Order.create({
        userID: userDetails?.id,
        tourID: tourDetails?.id,
        amount: tourDetails?.amount,
        status: 0,
      });

      if (!newOrder) {
        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Something went wrong. Please try again in sometime"
            )
          );
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json(
          createResponseObject(
            500,
            "Something went wrong. Please try again in sometime"
          )
        );
      return;
    }

    console.log(">>>orderDetails: ", userID, tourID, newOrder);

    let razorpayOrderDetails;

    try {
      razorpayOrderDetails = await razorpayInstance.orders.create({
        amount: Number(tourDetails?.amount) * 100,
        currency: "INR",
        receipt: newOrder?.id,
      });
    } catch (error) {
      console.log(">>>error in razorpay order details: ", error);
      res
        .status(500)
        .json(
          createResponseObject(
            500,
            "Our payment partner is facing some issue. Please try again in sometime."
          )
        );
      return;
    }

    console.log(">>>razorpayOrderDetails: ", razorpayOrderDetails);

    if (!razorpayOrderDetails) {
      res
        .status(411)
        .json(
          createResponseObject(
            500,
            "Our payment partner is facing some issue. Please try again in sometime."
          )
        );
      return;
    }

    let updateOrder;
    // for (let i = 0; i < 3; i++) {
    try {
      console.log(
        ">>>orderID with id: ",
        newOrder?.id,
        ", orderID with _id: ",
        newOrder?._id
      );
      updateOrder = await Order.findOneAndUpdate(
        {
          _id: newOrder?._id,
        },
        {
          $set: {
            razorpayOrderID: razorpayOrderDetails?.id,
          },
        },
        { new: true }
      );

      // if (updateOrder?.razorpayOrderID) {
      //   break;
      // }
    } catch (error) {
      // console.log(
      //   `Attempt ${i + 1} to update order with orderID - ${newOrder?.id}.`
      // );
      console.log(">>>error in updating order: ", error);
    }
    // }

    if (!updateOrder) {
      console.log(
        `Order with orderID - ${newOrder?.id} could not udpated with razorpayOrderID in the DB.`
      );
    }

    const response = {
      id: newOrder?.id,
      amount: razorpayOrderDetails?.amount,
      paymentOrderID: razorpayOrderDetails?.id,
    };

    res
      .status(200)
      .json(createResponseObject(200, "Order created successfully", response));

    return;
  }

  async getOrder(req: Request, res: Response): Promise<void> {
    const { userID } = req as GlobalRequestDTO;

    const { orderID } = req.params;

    if (!orderID) {
      res.status(411).json(createResponseObject(411, "No orderID found"));
      return;
    }

    const orderDetails = await Order.findById(orderID).select(
      "-razorpayOrderID -razorpayPaymentId -deletedAt"
    );

    if (userID != orderDetails?.userID?.toString()) {
      res.status(401).json(createResponseObject(401, "Unauthorized access"));
      return;
    }

    if (!orderDetails) {
      res
        .status(411)
        .json(createResponseObject(411, "No order exists for this id"));
      return;
    }

    res
      .status(200)
      .json(
        createResponseObject(200, "Order fetched successfully", orderDetails)
      );

    return;
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    const razorpaySignature = req.headers["x-razorpay-signature"];

    const razorpayresponse = JSON.stringify(req.body);

    if (!razorpaySignature || !razorpayresponse) {
      res
        .status(411)
        .json(
          createResponseObject(
            411,
            "Either no razorpaySignature or razorpayresponse not present"
          )
        );
      return;
    }

    console.log(">>>razorpaySignature: ", JSON.stringify(req.headers));
    console.log(">>>razorpayBody: ", JSON.stringify(req?.body));
    const doesSignatureMatch = checkSignature(
      razorpaySignature?.toString(),
      razorpayresponse
    );

    if (!doesSignatureMatch) {
      console.log(">>>signature did not match")
      res
        .status(411)
        .json(createResponseObject(411, "Razorpay signature does not match"));
      return;
    }

    const { razorpay_order_id, razorpay_payment_id } =
      req.body.payload.payment.entity;

    console.log(">>>razorpay_order_id: ", razorpay_order_id);

    const {
      tourID,
      userID,
      _id: orderID,
    } = (await Order.findOne({
      razorpayOrderID: razorpay_order_id,
    }).select("tourID userID _id")) as {
      tourID: string;
      userID: string;
      _id: string;
    };

    if (!tourID || !userID) {
      res
        .status(411)
        .json(createResponseObject(411, "No details of the order found"));
      return;
    }

    
    if (req.body.event === "order.paid") {
      const session = await mongoose.startSession();
      // Payment successful, update order status in DB
      try {
        session.startTransaction();

        await Order.findOneAndUpdate(
          { razorpayOrderID: razorpay_order_id },
          { $set: { razorpayPaymentId: razorpay_payment_id, status: 1 } },
          { new: true }
        );

        await PurchasedTour.create({
          orderID,
          tourID,
          userID,
        });

        session.commitTransaction();

        session.endSession();
        res.status(200).json(createResponseObject(200, "Payment successful"));
        return;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res
          .status(500)
          .json(
            createResponseObject(
              500,
              "Something went wrong. Please try again in sometime"
            )
          );
        return;
      }
    }

    if (req.body.event === "payment.failed") {
      // Payment failed, update order status in DB
      await Order.findOneAndUpdate(
        { _id: orderID },
        { $set: { status: 2 } },
        { new: true }
      );

      console.log(">>>in failed block: ",  razorpay_order_id, orderID);
    }

    res.status(200).json({ message: "Webhook processed" });
    return;
  }

  async getRazoropayCreds(req: Request, res: Response): Promise<void> {
    const razorpayCreds = getRazorpayCreds();

    res.status(200).json({
      ...razorpayCreds,
    });

    return;
  }
}
