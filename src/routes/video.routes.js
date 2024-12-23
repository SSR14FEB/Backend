import { Router } from "express";
import { videosUplodedByUser } from "../controllers/videos.controllers.js";
import { jwtValidation } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router()

router.route("/uplode-videos").post(jwtValidation,upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]),videosUplodedByUser)

export default router 