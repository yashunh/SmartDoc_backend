import express from "express"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";

const app = express.Router()

app.post("/prescription", authMiddleware, (req,res)=>{

})

export const prescriptionRouter = app