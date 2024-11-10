const asynyHandler = (fun) => async(res,rej,next)=>{
    try{
        await fun(res,rej,next)
    }
    catch(error){
        res.status(err.code || 500).json({
            success:false,
            massage:err.massage
        })
    };
}

export {asynyHandler}