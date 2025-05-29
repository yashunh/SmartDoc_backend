import express from "express"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express.Router()

app.post("/prescription", authMiddleware, (req,res)=>{

})

export const prescriptionRouter = app