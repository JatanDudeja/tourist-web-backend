import { Request, Response } from "express";
import Tour from "../models/tour.model.js";

export class TourController {
  async createTour(req: Request, res: Response) {
    const { name, description, place } = req.body || {};
    console.log(">>>name, description, place: ", name, description, place);

    if ([name, description, place].some((item) => !item)) {
      res.status(400).json({
        statusCode: 400,
        message: "name, description and place are required fields",
      });
      return;
    }

    try {
      await Tour.create({
        name,
        description,
        place,
      });

      res
        .status(200)
        .json({ statusCode: 200, message: "Tour added successfully!" });
    } catch (error) {
      console.log(
        ">>>here: ",
        res.status(500).json({
          statusCode: 500,
          message: "Please try again after sometime",
        })
      );
    }
    return;
  }
}
