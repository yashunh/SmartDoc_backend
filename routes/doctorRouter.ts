import { createPatient, getPatient, idSchema, signinBody, signupBody, updatePatient } from "../zod"
import express from "express"
import jwt from "jsonwebtoken"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express.Router()

app.post('/doctor/signin', async (req, res): Promise<any> => {
    const result = signinBody.safeParse(req.body);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }
    const doc = await prisma.doctor.findFirst({
        where: {
            email: req.body.email
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists, Signup"
        })
    }
    const {id,name,phoneNumber,email,specialty,degree,experience,officeAddress,bio,workingHours,workingDays,consultationFee,createdAt,password} = doc
    if (password !== req.body.password) {
        return res.status(411).json({
            message: "Incorrect Password"
        })
    }
    const token = jwt.sign({ doctorId: doc.id }, process.env.JWT_SECRET || "secret")
    return res.json({
        msg: "doctor logged in",
        token,
        doc: {
            id,name,phoneNumber,email,specialty,degree,experience,officeAddress,bio,workingHours,workingDays,consultationFee,createdAt
        }
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
        data: data,
        omit: {
            password: true
        }
    })
    const token = jwt.sign({ doctorId: newDoc.id }, process.env.JWT_SECRET || "secret")
    return res.json({
        msg: "doctor created",
        token,
        newDoc
    })
})

app.get("/doctor/profile", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const result = idSchema.safeParse(doctorId)
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        },
        omit: {
            password: true
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
    let data = {
        ...req.body,
        doctorId: req.params.doctorId
    }
    const result = createPatient.safeParse(data);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

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

app.get("/doctor/getPatientDetails/:patientId", authMiddleware, async (req, res): Promise<any> => {
    let data = {
        patientId: parseInt(req.params.patientId),
        doctorId: parseInt(req.params.doctorId)
    }
    const result = getPatient.safeParse(data);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
        });
    }

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

    const patient = await prisma.patient.findFirst({
        where: {
            id: data.patientId
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
    let data = {
        ...req.body,
        doctorId: req.params.doctorId
    }
    const result = updatePatient.safeParse(data);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }
    const { patientId, doctorId, name, age, sex, bloodGroup, phoneNumber } = data
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

export const doctorRouter = app