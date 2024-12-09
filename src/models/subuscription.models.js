import mongooes,{Schema, SchemaType, Types} from "mongoose" 

const subuscriptionSchema = new Schema({
    subuscriber:{
       type: Schema.Types.ObjectId,
       ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Sububscription = mongooes.model("Sububscription",subuscriptionSchema)