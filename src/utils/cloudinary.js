import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRATE,
});

const uploadOnCloudinary = async (LocalFilePath) =>{
  try {
    // upload file on cloudinary
    if(!LocalFilePath) return null
    const response = await cloudinary.uploader.upload(LocalFilePath,{
      resource_type:"auto",
      // public_id:"file"
    })
    // file uploded successfully 
    
  // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url("file", {
    //   crop: "auto",
    //   gravity: "auto",
    //   width: 500,
    //   height: 500,
    // });

    // // file optimise suscessfully 
    // const optimizeUrl = cloudinary.url("file", {
    //   fetch_format:"auto",
    //   quality:"auto"
    // })
    
    return response
} catch (error) {
    fs.unlinkSync(LocalFilePath) // it remove the locally saved temprory file as the operation gose faild
    console.log(error)
  }
}
export {uploadOnCloudinary}

