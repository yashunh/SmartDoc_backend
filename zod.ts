import { z } from "zod"

export const idSchema = z.number()

const timeSchema = z.string()//.regex(/^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)

const dateSchema = z.string()//.regex(/^(202[4-9]|20[3-9][0-9])-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)

const bloodGroup = z.enum(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"])

const sex = z.enum(['Male', 'Female', 'Other'])

const string = z.string()

const email = z.string().email()

const age = z.number().min(0)

export const signupBody = z.object({
    name: string,
    password: string,
    phoneNumber: string,
    email: email,
    degree: string
})

export const signinBody = z.object({
    email: email,
    password: string
})

export const updateDoctor = z.object({
    doctorId: idSchema,
    name: string.optional(),
    phoneNumber: string.optional(),
    specialty: string.optional(),
    degree: string.optional(),
    experience: string.optional(),
    officeAddress: string.optional(),
    bio: string.optional(),
    workingHours: string.optional(),
    workingDays: string.optional(),
    consultationFee:z.number().optional()
})

export const createPatient = z.object({
    doctorId: idSchema,
    age: age,
    sex: sex,
    name: string,
    bloodGroup: bloodGroup,
    phoneNumber: z.string(),
})

export const getPatient = z.object({
    doctorId: idSchema,
    patientId: idSchema,
})

export const updatePatient = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    age: age.optional(),
    sex: sex.optional(),
    name: string.optional(),
    bloodGroup: bloodGroup.optional(),
    phoneNumber: string.optional(),
})

export const createAppointment = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    day: z.number(),
    month: z.number(),
    year: z.number(),
    hours: z.number(),
    minutes: z.number()
})

export const changeAppointment = z.object({
    doctorId: idSchema,
    appointmentId: idSchema
})

export const createPrescription = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    currentCondition: string,
    diagnosis: string,
    treatment: string,
    advice: string
})

export const createVital = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    vitals: z.object({})
})

export const createMedication = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    medicine: z.object({})
})

export const createReport = z.object({
    doctorId: idSchema,
    patientId: idSchema,
    reports: z.array(z.object({}))
})

export const getPrescription = z.object({
    doctorId: idSchema,
    patientId: idSchema
})

export const getPrescriptionById = z.object({
    doctorId: idSchema,
    prescriptionId: idSchema
})