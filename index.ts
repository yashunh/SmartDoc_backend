import express, { ErrorRequestHandler } from "express"
import cors from "cors"
import { doctorRouter } from "./routes/doctorRouter"
import { appointmentRouter } from "./routes/appointmentRouter"
import { prescriptionRouter } from "./routes/prescriptionRouter"
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient()

const app = express()
app.use(express.json())
app.use(cors())

app.use(doctorRouter)
app.use(appointmentRouter)
app.use(prescriptionRouter)

app.use(((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        msg: 'Something broke!',
        err
    });
}) as ErrorRequestHandler)

app.listen(3000, () => console.log("server at 3000"))