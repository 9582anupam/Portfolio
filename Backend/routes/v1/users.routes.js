import { putMessage, newUser } from "../../controllers/user.controller.js";
import express from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/putMessage", putMessage);
router.post("/newUser", newUser);



export default router;