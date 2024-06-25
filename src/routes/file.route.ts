import { Router } from "express";
import { fileController } from "../controllers";

const fileRouter = Router()

fileRouter.get("/", fileController.getFile)
fileRouter.post("/", fileController.postFile)

export { fileRouter }