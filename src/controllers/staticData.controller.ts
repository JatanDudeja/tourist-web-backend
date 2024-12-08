import { Request, Response } from "express";
import { placesDescription } from "../static/index.js";
import { APIErrors } from "../utils/apiErrors.js";
import {
  getImageUrlCloudinary,
  getListOfImagesFromCloudinary,
} from "../utils/cloudinary.js";

export class StaticDataController {
  getDescriptionForPlaces(req: Request, response: Response): void {
    response.status(200).json({
      length: placesDescription?.length || 0,
      data: placesDescription || [],
    });
  }

  async getImages(req: Request, res: Response): Promise<void> {
    const { query } = req || {};
    if (!query) {
      console.log("No query received for finding image.");
      throw new APIErrors({
        statusCode: 400,
        message: "No image with this id found",
      });
    }

    const { defaultImage, id: imageID } = query || {};

    if (!imageID) {
      console.log("No id received in query to fetch the image.");
      throw new APIErrors({
        statusCode: 400,
        message: "No image with this id found",
      });
    }

    if (defaultImage) {
      const imagesURLs = await getListOfImagesFromCloudinary(imageID as string);
      res.status(200).json({
        statusCode: 200,
        message: "Image fetched successfully!",
        data: {
          length: imagesURLs?.length || 0,
          data: imagesURLs || [],
        },
      });

      return;
    }

    const imageURL = await getImageUrlCloudinary(imageID as string);

    res.status(200).json({
      statusCode: 200,
      message: "Image fetched successfully!",
      data: imageURL,
    });
  }
}
