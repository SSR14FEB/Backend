class apiResponse{
    constructor(
        statucode,data,massage="success"
    ){
        this.statucode = statucode
        this.data = data
        this.massage = massage
        this.success = statucode < 400
    }
}