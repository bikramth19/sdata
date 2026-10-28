import { db } from "@/lib/db";
import { studentSchema } from "@/lib/validation";
import { z } from "zod";

type NewStudent = z.infer<typeof studentSchema>;
export function formatRegistration(settings: {registrationPrefix: string; registrationSeparator: string; registrationIncludeYear: boolean; registrationDigits: number}, seq: number, year = new Date().getFullYear()) {
  return [settings.registrationPrefix, ...(settings.registrationIncludeYear ? [year] : []), String(seq).padStart(settings.registrationDigits, "0")].join(settings.registrationSeparator);
}
export async function registerStudent(data: NewStudent, source: "PUBLIC" | "STAFF") {
  return db.$transaction(async tx => {
    const settings = await tx.appSetting.update({ where: { id: "global" }, data: { nextRegistrationNumber: { increment: 1 } } });
    if (source === "PUBLIC" && !settings.publicRegistrationOpen) throw new Error("Public registration is currently closed.");
    const registrationNo = formatRegistration(settings, settings.nextRegistrationNumber - 1);
    const student = await tx.student.create({ data: {
      ...data, email: data.email || null, dateOfBirth: data.dateOfBirth || null,
      guardianName: data.guardianName || null, guardianPhone: data.guardianPhone || null,
      address: data.address || null, notes: data.notes || null, registrationNo, source
    }});
    await tx.notification.create({ data: {
      title: "New student registered", message: `${data.firstName} ${data.lastName} · ${registrationNo}`,
      type: "REGISTRATION"
    }});
    return student;
  });
}
