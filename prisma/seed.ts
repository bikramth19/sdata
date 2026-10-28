import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PERMISSIONS } from "../lib/permissions";

const prisma = new PrismaClient();

async function main() {
  await prisma.appSetting.upsert({ where: { id: "global" }, update: {}, create: { id: "global" } });
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: { permissions: JSON.stringify(ALL_PERMISSIONS), isSystem: true },
    create: { name: "Administrator", description: "Complete access to every module", permissions: JSON.stringify(ALL_PERMISSIONS), isSystem: true }
  });
  await prisma.role.upsert({
    where: { name: "Registrar" }, update: {},
    create: { name: "Registrar", description: "Student enrollment and reporting", permissions: JSON.stringify(["dashboard.view", "students.view", "students.create", "students.edit", "reports.view", "reports.export", "notifications.view"]), isSystem: true }
  });
  await prisma.role.upsert({
    where: { name: "Viewer" }, update: {},
    create: { name: "Viewer", description: "Read-only student and dashboard access", permissions: JSON.stringify(["dashboard.view", "students.view", "reports.view", "notifications.view"]), isSystem: true }
  });
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || password.startsWith("REPLACE_")) {
    throw new Error("Set a real ADMIN_EMAIL and a strong ADMIN_PASSWORD (12+ characters) in .env before seeding.");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    await prisma.user.create({ data: {
      name: process.env.ADMIN_NAME || "Monoline Administrator", email,
      passwordHash: await bcrypt.hash(password, 12), roleId: adminRole.id
    } });
    console.log(`Administrator created: ${email}`);
  } else {
    console.log(`Administrator already exists: ${email}. Existing password was NOT changed.`);
  }
  console.log("Database initialized without sample student data.");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
