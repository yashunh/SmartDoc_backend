import express, { ErrorRequestHandler } from "express"
import cors from "cors"
import { createPatient, getPatient, idSchema, signinBody, signupBody, updatePatient } from "./zod"
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken"
import dotenv from 'dotenv';
import path from 'path';
import { authMiddleware } from "./middleware/authMiddleware";

const prisma = new PrismaClient()
const app = express()
app.use(express.json())
app.use(cors())
dotenv.config({ path: path.join(__dirname, '../.env') });

const today = new Date();
let startOfDay = new Date(today);
let endOfDay = new Date(today);
startOfDay.setUTCHours(0, 0, 0, 0);
endOfDay.setUTCHours(23, 59, 59, 999);
startOfDay.setUTCHours(startOfDay.getUTCHours() - 5, startOfDay.getUTCMinutes() - 30);
endOfDay.setUTCHours(endOfDay.getUTCHours() - 5, endOfDay.getUTCMinutes() - 30);

app.post('/doctor/signin', async (req, res): Promise<any> => {
    const result = signinBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }
    const { email, password } = result.data;

    const doc = await prisma.doctor.findFirst({
        where: {
            email: email
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists, Signup"
        })
    }

    if (doc.password !== password) {
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }
    const token = jwt.sign({ doctorId: doc.id }, process.env.JWT_SECRET || "secret")
    return res.json({
        msg: "doctor logged in",
        token
    })
})

app.post("/doctor/signup", async (req, res): Promise<any> => {
    const result = signupBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }
    let data = result.data;

    const doc = await prisma.doctor.findFirst({
        where: {
            email: data.email
        }
    })
    if (doc) {
        return res.status(411).json({
            message: "Email already exists, Signin"
        })
    }

    const newDoc = await prisma.doctor.create({
        data: data
    })
    const token = jwt.sign({ doctorId: newDoc.id }, process.env.JWT_SECRET || "secret")
    return res.json({
        msg: "doctor created",
        token
    })
})

app.get("/doctor/profile", authMiddleware, async (req, res): Promise<any> => {
    const result = idSchema.safeParse(req.body.doctorId)
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: req.body.doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }
    return res.json({
        doc
    })
})

app.post("/doctor/create/patient", authMiddleware, async (req, res): Promise<any> => {
    const result = createPatient.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }
    let data = result.data;

    const doc = await prisma.doctor.findFirst({
        where: {
            id: data.doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const newPatient = await prisma.patient.create({
        data: data
    })
    return res.json({
        msg: "patient created",
        newPatient
    })
})

app.post("/doctor/getDetails/patient", authMiddleware, async (req, res): Promise<any> => {
    const result = getPatient.safeParse(req.body.doctorId);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: req.body.doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const patient = await prisma.patient.findFirst({
        where: {
            id: req.body.patientId
        }
    })
    if (!patient) {
        return res.status(411).json({
            message: "Patient does not exists"
        })
    }
    return res.json({
        msg: "patient details fetched",
        patient
    })
})

app.post("/doctor/updateDetails/patient", authMiddleware, async (req, res): Promise<any> => {
    const result = updatePatient.safeParse(req.body.doctorId);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }
    const { patientId, doctorId, name, age, sex, bloodGroup, phoneNumber } = result.data

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "User does not exists"
        })
    }

    const patient = await prisma.patient.findFirst({
        where: {
            id: patientId
        }
    })
    if (!patient) {
        return res.status(411).json({
            message: "Patient does not exists"
        })
    }

    const newPatient = await prisma.patient.update(({
        where: {
            id: patientId
        },
        data: {
            name: name ? name : patient?.name,
            age: age ? age : patient?.age,
            phoneNumber: phoneNumber ? phoneNumber : patient?.phoneNumber,
            bloodGroup: bloodGroup ? bloodGroup : patient?.bloodGroup,
            sex: sex ? sex : patient?.sex
        }
    }))
    return res.json({
        msg: "patient details updated",
        newPatient
    })
})

// app.post("/appointment/create", authMiddleware, async(req, res):Promise<any>=>{

// })

// app.post("/prescription")

app.use(((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        msg: 'Something broke!',
        err
    });
}) as ErrorRequestHandler)

app.listen(3000, () => console.log("server at 3000"))