import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

interface CustomRequest extends Request {
    doctorId?: string;
}

export const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
    const headers = req.headers.authorization;
    if (!headers || !headers.startsWith('Bearer ')) {
        res.status(403).json({ msg: "Invalid headers" });
        return;
    }

    const token = headers.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { doctorId: string };
        req.doctorId = decoded.doctorId;
        next();
    } catch (err) {
        res.status(403).json({ msg: "Invalid token" });
    }
};
