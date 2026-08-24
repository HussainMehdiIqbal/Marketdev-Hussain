import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Site Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before seeding. Never seed with a hard-coded default password."
    );
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin account ready: ${admin.email}`);

  // Starter categories — safe to edit or remove from the admin panel afterwards.
  const categoryNames = ["Web Application", "Mobile App", "Admin Dashboard", "E-commerce", "API / Backend"];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") },
    });
  }
  console.log(`✔ Seeded ${categoryNames.length} starter categories`);

  // Starter technologies.
  const techNames = ["Next.js", "React", "Node.js", "Laravel", "PHP", "MySQL", "PostgreSQL", "TypeScript", "Tailwind CSS", "Express"];
  for (const name of techNames) {
    await prisma.technology.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`✔ Seeded ${techNames.length} starter technologies`);

  console.log("\nSeeding complete. Log in at /admin/login with the ADMIN_EMAIL/ADMIN_PASSWORD from your .env.");
  console.log("Rotate that password from a real account-settings flow before going to production.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
