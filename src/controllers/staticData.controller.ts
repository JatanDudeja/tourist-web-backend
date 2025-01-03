import { Request, Response } from "express";
import { placesDescription } from "../static/index.js";
import { APIErrors } from "../utils/apiErrors.js";
import {
  getImageUrlCloudinary,
  getListOfImagesFromCloudinary,
  getResourcesFromFolder,
} from "../utils/cloudinary.js";

export class StaticDataController {
  private readonly folders = [1, 2, 3, 4, 5];

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
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    const { defaultImage, id: imageID } = query || {};

    if (!imageID) {
      console.log("No id received in query to fetch the image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return
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

    if (!query) {
      const allImages = await Promise.all([getListOfImagesFromCloudinary]);
    }
  }

  async getAudios(req: Request, res: Response): Promise<void> {
    const { query } = req || {};
    if (!query) {
      console.log("No query received for finding image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    const { defaultAudio, id: imageID } = query || {};

    if (!imageID) {
      console.log("No id received in query to fetch the image.");
      res.status(400).json({
        statusCode: 400,
        message: "No image with this id found",
      });
      return;
    }

    if (defaultAudio) {
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

  async getAllImages(req: Request, res: Response) {
    const allResources = [];

    for (const folder of this.folders) {
      const resources = await getResourcesFromFolder(folder);
      allResources.push(...resources);
    }

    if (allResources.length > 0) {
      const allImages: any = {};

      allResources?.forEach((item) => {
        const folderNumber = item?.folder?.replace("static_images/", "");
        const isDefault = item?.public_id?.search("default");
        if (allImages?.hasOwnProperty(folderNumber)) {
          allImages[folderNumber]?.push({
            id: item?.asset_id,
            imageID:
              isDefault !== -1
                ? "default"
                : item?.public_id?.replace("/static_images/", "")?.slice(-1),
            url: item?.url,
          });
        } else {
          allImages[folderNumber] = [
            {
              id: item?.asset_id,
              imageID:
                isDefault !== -1
                  ? "default"
                  : item?.public_id?.replace("static_images/", "")?.slice(-1),
              url: item?.url,
            },
          ];
        }
      });

      res.status(200).json({
        statusCode: 200,
        message: "All Images fetched successfully",
        newData: { length: allImages?.length, data: allImages},
      });
      return;
    }

    res.status(200).json({
      statusCode: 200,
      message: "No images found",
      data: [],
    });
  }
}
