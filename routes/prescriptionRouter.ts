import express from "express"
import { authMiddleware } from "../middleware/authMiddleware";
import { prisma } from "../index";
import { createPrescription, createReport, createVital, getPrescription, getPrescriptionById } from "../zod";

const app = express.Router()

app.post("/prescription/create", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const patientId = parseInt(req.body.patientId)
    // let appointmentId = req.body.appointmentId

    const prescriptionData = {
        ...req.body.prescription,
        doctorId,
        patientId
    }
    const prescriptionResult = createPrescription.safeParse(prescriptionData);
    if (!prescriptionResult.success) {
        return res.status(411).json({
            message: 'Incorrect inputs in prescription',
            prescriptionResult
        });
    }

    const vitalData = {
        vitals: req.body.vitals,
        doctorId,
        patientId
    }
    const vitalResult = createVital.safeParse(vitalData);
    if (!vitalResult.success) {
        return res.status(411).json({
            message: 'Incorrect inputs in vital',
            vitalResult
        });
    }

    const reportData = {
        reports: req.body.reports,
        doctorId,
        patientId
    }
    const reportResult = createReport.safeParse(reportData);
    if (!reportResult.success) {
        return res.status(411).json({
            message: 'Incorrect inputs in report',
            reportResult
        });
    }

    const medicationData = {
        medicine: req.body.reports,
        doctorId,
        patientId
    }
    const medicationResult = createReport.safeParse(medicationData);
    if (!medicationResult.success) {
        return res.status(411).json({
            message: 'Incorrect inputs in report',
            medicationResult
        });
    }

    try {
        let appointment = await prisma.appointment.findFirst({
            where: {
                id: req.body.appointmentId
            }
        })
        if (!appointment) {
            appointment = await prisma.appointment.create({
                data: {
                    patientId: prescriptionData.patientId,
                    doctorId: prescriptionData.doctorId,
                    datetime: new Date()
                }
            })
        }

        const prescription = await prisma.prescription.create({
            data: {
                ...prescriptionData,
                appointmentId: appointment.id
            }
        })

        const vital = await prisma.vital.create({
            data: {
                ...vitalData,
                appointmentId: appointment.id
            }
        })

        const report = await prisma.report.create({
            data: {
                ...reportData,
                appointmentId: appointment.id
            }
        })

        const medication = await prisma.medication.create({
            data: {
                ...medicationData,
                appointmentId: appointment.id
            }
        })

        return res.send({
            msg: "created",
            prescription,
            vital,
            medication,
            report
        })
    } catch (error) {
        return res.status(403).send({
            msg: "error in creating prescription",
            error
        })
    }
})

app.get("/prescription/last/:patientId", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const patientId = parseInt(req.params.patientId)
    let result = getPrescription.safeParse({
        doctorId,
        patientId
    });
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    try {
        const appointment = await prisma.appointment.findMany({
            where: {
                patientId
            },
            orderBy: {
                datetime: "desc"
            },
            take: 1
        })

        const prescription = await prisma.prescription.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const vital = await prisma.vital.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const medication = await prisma.medication.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const report = await prisma.report.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })

        return res.send({
            msg: "found result",
            prescription,
            vital,
            medication,
            report
        })
    } catch (error) {
        return res.status(403).send({
            msg: "error in finding prescription",
            error
        })
    }
})

app.get("/prescription/history/:patientId", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const patientId = parseInt(req.params.patientId)
    let result = getPrescription.safeParse({
        doctorId,
        patientId
    });
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    try {
        const appointment = await prisma.appointment.findMany({
            where: {
                patientId
            },
            orderBy: {
                datetime: "desc"
            }
        })

        const prescription = await prisma.prescription.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const vital = await prisma.vital.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const medication = await prisma.medication.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })
        const report = await prisma.report.findFirst({
            where: {
                appointmentId: appointment[0].id
            }
        })

        return res.send({
            msg: "found result",
            prescription,
            vital,
            medication,
            report
        })
    } catch (error) {
        return res.status(403).send({
            msg: "error in finding prescription",
            error
        })
    }
})

app.post("/prescription/:prescriptionId", authMiddleware, async (req, res): Promise<any> => {
    const doctorId = parseInt(req.params.doctorId)
    const prescriptionId = parseInt(req.params.prescriptionId)
    let result = getPrescriptionById.safeParse({
        doctorId,
        prescriptionId
    });
    if (!result.success) {
        return res.status(411).json({
            message: 'Incorrect inputs',
            result
        });
    }

    try {
        const prescription = await prisma.prescription.findFirst({
            where: {
                id: prescriptionId
            }
        })
        const vital = await prisma.vital.findFirst({
            where: {
                appointmentId: prescription?.appointmentId
            }
        })
        const medication = await prisma.medication.findFirst({
            where: {
                appointmentId: prescription?.appointmentId
            }
        })
        const report = await prisma.report.findFirst({
            where: {
                appointmentId: prescription?.appointmentId
            }
        })

        return res.send({
            msg: "found result",
            prescription,
            vital,
            medication,
            report
        })
    } catch (error) {
        return res.status(403).send({
            msg: "error in finding prescription",
            error
        })
    }
})

export const prescriptionRouter = app