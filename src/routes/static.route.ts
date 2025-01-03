import { Router } from "express";
import { StaticDataController } from "../controllers/staticData.controller.js";

const router = Router();

const staticDataController = new StaticDataController();

router
  .route("/getPlacesDescription")
  .get(
    staticDataController?.getDescriptionForPlaces.bind(staticDataController)
  );

router
  .route("/getStaticImages")
  .get(staticDataController.getImages.bind(staticDataController));

  router
  .route("/getAllImages")
  .get(staticDataController.getAllImages.bind(staticDataController));

export default router;
