import {v2 as cloudinary} from "cloudinary"
import { extractPublicId } from 'cloudinary-build-url'
import { response } from "express"
import { apiError } from "./apiError.js"
import fs from 'fs'

const deleteAssest = async(prevFile)=>{
    try {
        const publicId =  extractPublicId(prevFile)
        console.log(publicId)
        const response = await cloudinary.uploader.destroy(publicId,{
            resource_type:"image"
        })
        return response
    } catch (error) {
        throw new apiError(401,"Something went wrong while deleting privious assets")
    }
}

export {deleteAssest}