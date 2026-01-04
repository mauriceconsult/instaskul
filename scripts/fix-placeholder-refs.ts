import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔧 Fixing placeholder references...");

  // Fix admins
  const adminsFixed = await prisma.admin.updateMany({
    where: {
      OR: [
        { imageUrl: "/placeholder-admin.jpg" },
        { imageUrl: "placeholder-admin.jpg" },
      ],
    },
    data: {
      imageUrl: null,
    },
  });
  console.log(`✅ Fixed ${adminsFixed.count} admin records`);

  // Fix courses
  const coursesFixed = await prisma.course.updateMany({
    where: {
      OR: [
        { imageUrl: "/placeholder-course.jpg" },
        { imageUrl: "placeholder-course.jpg" },
      ],
    },
    data: {
      imageUrl: null,
    },
  });
  console.log(`✅ Fixed ${coursesFixed.count} course records`);

  console.log("\n🎉 All placeholder references removed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error("❌ Error:", e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });