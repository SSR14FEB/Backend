const asyncHandler = (fun) =>  async (req, res) => {
    try {
        await fun(res, res); 
    } catch (error) {
        res.status(error.code || 500).json({
            success: false, 
            message: error.message || "Internal Server Error",
        });
        next(error)
    }
};


export {asyncHandler}
 