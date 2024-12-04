import {Router} from 'express'
import { registerUser } from '../controllers/users.controllers.js'
import { upload } from '../middlewares/multer.middlewares.js'
import { logInUser} from '../controllers/users.controllers.js'
import { logOutUser } from '../controllers/users.controllers.js'
import { jwtValidation } from '../middlewares/auth.middlewares.js'

const router = Router()

router.route("/register").post(upload.fields([
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

router.route("/login").post(logInUser)

router.route("/logout").post(jwtValidation, logOutUser)

export default router  