import { z } from "zod";
export const studentSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.union([z.string().trim().email().max(150), z.literal("")]).optional().default(""),
  phone: z.string().trim().min(6).max(25),
  dateOfBirth: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).default("OTHER"),
  program: z.string().trim().min(1).max(120),
  guardianName: z.string().trim().max(100).optional().default(""),
  guardianPhone: z.string().trim().max(25).optional().default(""),
  address: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(1000).optional().default("")
});
export const userSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(12).max(128),
  roleId: z.string().min(1)
});
export const settingSchema = z.object({
  institutionName: z.string().trim().min(2).max(100),
  registrationPrefix: z.string().trim().regex(/^[A-Za-z0-9-]{2,12}$/).transform(x => x.toUpperCase()),
  registrationSeparator: z.enum(["/", "-", "_"]),
  registrationDigits: z.number().int().min(3).max(10),
  registrationIncludeYear: z.boolean(),
  nextRegistrationNumber: z.number().int().min(1).max(999999999),
  publicRegistrationOpen: z.boolean()
});
