import { asyncHandler } from "../utils/asyncHandler.js";
import { Videos } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";

const videosUplodedByUser = asyncHandler(async (req, res) => {
  const { videoFile, thumbnail, title, description } = req.body;
  if (
    [videoFile, thumbnail, title, description].some((fields) => {
      fields?.trim() == " ";
    })
  ) {
    throw new apiError(400, "All fields are required");
  }

  const localUserVideoPath = req.files?.videoFile[0].path;
  let localUserThumbnailPath = null;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    localUserThumbnailPath = req.files?.thumbnail[0]?.path;
  }
  console.log(localUserVideoPath)
  if (!localUserVideoPath) {
    throw new apiError(400, "Video is required");
  }

  const uplodedVideoUrl = await uploadOnCloudinary(localUserVideoPath);
  if (!uplodedVideoUrl) {
    throw new apiError(400, "Something went wrong whlie uploading video");
  }

  const uplodedThumbnailUrl = await uploadOnCloudinary(localUserThumbnailPath);
  


  const videos = await Videos.create({
    title,
    thumbnail: uplodedThumbnailUrl.url || "",
    videoFile: uplodedVideoUrl.url,
    description,
    duration:uplodedVideoUrl.duration,
    views:uplodedVideoUrl.views,
    owner: req.user._id,
  });

  await User.findByIdAndUpdate(req.user._id,{
    $set:{
      uplodedVideos:videos._id
    }
  },{new:true}
)
    return res
    .status(200)
    .json(new apiResponse(200, videos, "Video uploaded successfully"));
});

export {
   videosUplodedByUser,      
 };
