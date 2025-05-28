import express from "express"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express.Router()

const today = new Date();
let startOfDay = new Date(today);
let endOfDay = new Date(today);
startOfDay.setUTCHours(0, 0, 0, 0);
endOfDay.setUTCHours(23, 59, 59, 999);
startOfDay.setUTCHours(startOfDay.getUTCHours() - 5, startOfDay.getUTCMinutes() - 30);
endOfDay.setUTCHours(endOfDay.getUTCHours() - 5, endOfDay.getUTCMinutes() - 30);

app.post("/appointment/create", authMiddleware, async(req, res):Promise<any>=>{
    let data = {
        ...req.body,
        doctorId: req.params.doctorId
    }


})

export const appointmentRouter = app