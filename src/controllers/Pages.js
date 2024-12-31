import {asyncHandler} from '../utils/asyncHandler.js';
import {apiResponse} from '../utils/apiResponse.js';
import {apiError} from '../utils/apiError.js';
import {Videos} from '../models/video.models.js'


const Pages = asyncHandler(async(req, res) => {

    const {page,limit,search} = req.query

         const aggregateQuery =  Videos.aggregate([
            {
                $match:{
                    title:{
                        $regex:search,"$options":"i"
                    }
                }
            },
             {
                 $project:{
                     videoFile:1,
                     thumbnail:1,
                     title:1,
                     owner:1,
                     duration:1,
                     description:1,
                     views:1
                 }
             }
         ])
        
         const option = {
            page:page||2,
            limit:limit||10
         }
        

         const result = await Videos.aggregatePaginate(aggregateQuery,option)

         if(!result){
            throw new apiError(404,"Videos not available")
         }

         return res
         .status(200) // Ensure a valid HTTP status code
         .json(new apiResponse(200,result,"Paginated videos"));

})

export {Pages}