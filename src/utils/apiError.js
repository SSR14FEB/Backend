class apiError extends Error{
    constructor(
        statuscode,
        massage = "Something went wrong",
        error =[],
        stack =""
    ){

        super(massage)
        this.statuscode = statuscode
        this.massage = massage
        this.error = error
        this.success = false
        this.data = null
        
        if(stack)
            this.stack = stack
        else
        Error.captureStackTrace(this,this.constructor)
    }
}

export {apiError}