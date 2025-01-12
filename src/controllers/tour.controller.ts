import { Request, Response } from "express";
import Tour from "../models/tour.model.js";
import {
  getResourcesFromFolder,
  getSingleResouceFromFolder,
} from "../utils/cloudinary.js";
import PurchasedTour from "../models/purchasedTour.model.js";
import User from "../models/user.model.js";
import { GlobalRequestDTO } from "../types/user.types.js";
import {
  getPresignedUrlsForFolder
} from "../utils/s3Helper.js";

export class TourController {
  private readonly foldersArray = [1, 2, 3, 4, 5];

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

  async getTour(req: Request, res: Response): Promise<void> {
    const { id } = req?.params;

    if (!id) {
      res.status(400).json({
        statusCode: 400,
        message: "No id found",
      });
    }

    const tourDetails = await Tour.findById(id).select(
      "-createdAt -updatedAt -__v -deletedAt"
    );

    const [rawPlaceImages, rawPlaceAudios] = await Promise.all([
      getPresignedUrlsForFolder(`toursImages/${tourDetails?.mappingID}`),
      getPresignedUrlsForFolder(`toursAudios/trial/${tourDetails?.mappingID}`),
    ]);

    console.log(">>>rawPlaceAudios: ", rawPlaceAudios);

    const placesDescription = {
      id: tourDetails?._id,
      name: tourDetails?.name,
      description: tourDetails?.description,
      place: tourDetails?.place,
      amount: tourDetails?.amount,
      mappingID: tourDetails?.mappingID,
    };

    const filteredPlaceImages = Array.isArray(rawPlaceImages)
      ? rawPlaceImages?.map((item: any, id: number) => {
          const isDefault = item?.name?.search("default");
          return {
            id: id + 1,
            imageName: isDefault !== -1 ? "default" : item?.name,
            url: item?.url,
          };
        })
      : [];

    const filteredPlaceAudios = Array.isArray(rawPlaceAudios)
      ? rawPlaceAudios?.map((item: any, id: number) => {
          const isDefault = item?.name?.search("default");
          return {
            id: id + 1,
            imageName: isDefault !== -1 ? "default" : item?.name,
            url: item?.url,
          };
        })
      : [];

    const placeCompleteData = {
      ...placesDescription,
      images: filteredPlaceImages || [],
      audios: filteredPlaceAudios || [],
    };

    res.status(200).json({
      statusCode: 200,
      message: "Data fetched successfully.",
      data: placeCompleteData,
    });
    return;
  }
}
