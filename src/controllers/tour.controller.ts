import { Request, Response } from "express";
import Tour from "../models/tour.model.js";

export class TourController {
  async createTour(req: Request, res: Response) {
    const { mappingID, name, description, place, amount } = req.body || {};

    if ([mappingID, name, description, place].some((item) => !item)) {
      res.status(400).json({
        statusCode: 400,
        message: "mappingID, name, description and place are required fields",
      });
      return;
    }

    try {
      await Tour.create({
        name,
        description,
        place,
        mappingID,
        amount,
      });

      res
        .status(200)
        .json({ statusCode: 200, message: "Tour added successfully!" });
    } catch (error) {
      console.log("Error: ", JSON.stringify(error));
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }

  async getAllTours(req: Request, res: Response) {
    try {
      const toursDetails = await Tour.find({}).select(
        "-createdAt -updatedAt -__v -deletedAt"
      );

      const response = toursDetails.map((tour) => {
        return {
          id: tour._id,
          name: tour.name,
          description: tour.description,
          place: tour.place,
          amount: tour.amount,
          mappingID: tour.mappingID,
        };
      });

      res.status(200).json({
        statusCode: 200,
        message: "All tours fetched successfully!",
        data: response,
      });
    } catch (error) {
      console.log("Error in get tours api: ", JSON.stringify(error));
      res.status(500).json({
        statusCode: 500,
        message: "Please try again after sometime",
      });
    }
    return;
  }
}
