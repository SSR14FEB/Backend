import {Router} from 'express'
import { 
    changeCurrentPassword, 
    currentUser, 
    getUserChanelProfile, 
    getUserVideo, 
    getUserWatchHistory, 
    registerUser, 
    upadteAccountDetalis, 
    updatedUserAvatar, 
    updatedUserCoverIamger 
} from '../controllers/users.controllers.js'
import { upload } from '../middlewares/multer.middlewares.js'
import { logInUser} from '../controllers/users.controllers.js'
import { logOutUser } from '../controllers/users.controllers.js'
import { jwtValidation } from '../middlewares/auth.middlewares.js'
import { refershAcessToken } from '../controllers/users.controllers.js'

const router = Router()

router
.route("/register")
.post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]), 
registerUser)

router
.route("/login")
.post(logInUser)

router
.route("/logout")
.post(jwtValidation, logOutUser)

router
.route("/refres-token")
.post(refershAcessToken)

router
.route("/get-current-user")
.get(jwtValidation, currentUser)

router
.route("/change-password")
.patch(jwtValidation,changeCurrentPassword)

router
.route("/update-user-details")
.patch(jwtValidation, upadteAccountDetalis)

router
.route("/upadate-user-avatar")
.patch(jwtValidation, upload.single("avatar"),updatedUserAvatar)

router
.route("/upadate-user-coverImage")
.patch(jwtValidation, upload.single("coverimage"),updatedUserCoverIamger)

router
.route("/chanel/:username")
.get(jwtValidation, getUserChanelProfile)

router
.route("/history")
.get(jwtValidation, getUserWatchHistory)

router
.route("/user-videos/:userName")
.post(jwtValidation, getUserVideo)

export default router  