import express from "express"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";
import { createAppointment, idSchema } from "../zod";

const app = express.Router()

const today = new Date();
let startOfDay = new Date(today);
let endOfDay = new Date(today);
startOfDay.setUTCHours(0, 0, 0, 0);
endOfDay.setUTCHours(23, 59, 59, 999);
startOfDay.setUTCHours(startOfDay.getUTCHours() - 5, startOfDay.getUTCMinutes() - 30);
endOfDay.setUTCHours(endOfDay.getUTCHours() - 5, endOfDay.getUTCMinutes() - 30);

app.post("/appointment/create", authMiddleware, async (req, res): Promise<any> => {
    let data = {
        ...req.body,
        doctorId: req.params.doctorId
    }

    const result = createAppointment.safeParse(data);
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

    let dateTime = new Date(data.year, data.month - 1, data.day, data.hours, data.minutes)
    const appointment = await prisma.appointment.create({
        data: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            datetime: dateTime
        }
    })

    return res.send({
        message: "appointment created",
        appointment
    })
})

app.get("/appointment/today", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const result = idSchema.safeParse(doctorId);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const todayAppointment = await prisma.appointment.findMany({
        where: {
            doctorId,
            datetime: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    })

    return res.send(todayAppointment)
})

app.get("/appointment/next", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const result = idSchema.safeParse(doctorId);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const nextAppointment = await prisma.appointment.findMany({
        where: {
            doctorId,
            datetime: {
                gte: startOfDay,
                lte: endOfDay
            },
            completed: false
        },
        orderBy: {
            datetime: "asc"
        }
    })

    return res.send(nextAppointment)
})

app.get("/appointment/current", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const result = idSchema.safeParse(doctorId);
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const currentAppointment = await prisma.appointment.findMany({
        where: {
            doctorId,
            datetime: {
                gte: startOfDay,
                lte: endOfDay
            },
            completed: false
        },
        orderBy: {
            datetime: "asc"
        },
        take: 1
    })

    return res.send(currentAppointment)
})

app.put("/appointment/complete/:appointmentId", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    let result1 = idSchema.safeParse(doctorId);
    const appointmentId = parseInt(req.params.appointmentId)
    let result2 = idSchema.safeParse(appointmentId);
    if (!result1.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result1
        });
    }
    if (!result2.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result2
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    const updatedAppointment = await prisma.appointment.update({
        where: {
            id: appointmentId
        },
        data: {
            completed: true
        }
    })
    if (!updatedAppointment) {
        return res.status(411).json({
            message: "error in completing appointment"
        })
    }

    return res.send({
        updatedAppointment,
        message: "Appointment updated"
    })
})

app.delete("/appointment/cancel/:appointmentId", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    let result1 = idSchema.safeParse(doctorId);
    const appointmentId = parseInt(req.params.appointmentId)
    let result2 = idSchema.safeParse(appointmentId);
    if (!result1.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result1
        });
    }
    if (!result2.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result2
        });
    }

    const doc = await prisma.doctor.findFirst({
        where: {
            id: doctorId
        }
    })
    if (!doc) {
        return res.status(411).json({
            message: "Doctor does not exists"
        })
    }

    try {
        const canceledAppointment = await prisma.appointment.delete({
            where: {
                id: appointmentId,
                completed: false
            }
        })
        return res.send({
            canceledAppointment,
            message: "Appointment updated"
        })
    } catch (err) {
        return res.status(411).json({
            message: "error in deleting appointment, appointment does not exist or completed",
            err
        })
    }
})

export const appointmentRouter = app