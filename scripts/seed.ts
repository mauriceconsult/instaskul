// scripts/seed.ts
import { PrismaClient } from "@prisma/client";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Create adapter for Prisma 7
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  await prisma.school.createMany({
    data: [
      { id: "school-1", name: "Engineering & Technology" },
      { id: "school-2", name: "Arts & Humanities" },
      { id: "school-3", name: "Social Sciences" },
      { id: "school-4", name: "Natural Sciences" },
      { id: "school-5", name: "Business & Management" },
      { id: "school-6", name: "Health Sciences" },
      { id: "school-7", name: "Sports & Fitness" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Schools seeded");

  await prisma.admin.createMany({
    data: [
      {
        id: "admin-1",
        userId: "user_admin_tech_123",
        title: "Dr. John Smith",
        description: "Senior Programming Instructor",
        schoolId: "school-1",
        imageUrl: "/placeholder-admin.jpg",
        isPublished: true,
        position: 0,
      },
      {
        id: "admin-2",
        userId: "user_admin_arts_456",
        title: "Prof. Sarah Johnson",
        description: "Digital Arts Expert",
        schoolId: "school-2",
        imageUrl: "/placeholder-admin.jpg",
        isPublished: true,
        position: 1,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Admins seeded");

  await prisma.course.createMany({
    data: [
      {
        id: "course-1",
        title: "Introduction to Programming",
        userId: "user_admin_tech_123",
        adminId: "admin-1",
        amount: "50000",
        description: "Learn JavaScript basics.",
        imageUrl: "/placeholder-course.jpg",
        isPublished: true,
        position: 0,
      },
      {
        id: "course-2",
        title: "Web Development with Next.js",
        userId: "user_admin_tech_123",
        adminId: "admin-1",
        amount: "75000",
        description: "Build modern web apps.",
        imageUrl: "/placeholder-course.jpg",
        isPublished: true,
        position: 1,
      },
      {
        id: "course-3",
        title: "Digital Art Fundamentals",
        userId: "user_admin_arts_456",
        adminId: "admin-2",
        amount: "60000",
        description: "Master digital illustration.",
        imageUrl: "/placeholder-course.jpg",
        isPublished: true,
        position: 2,
      },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Courses seeded");

  await prisma.tutor.createMany({
    data: [
      { id: "tutorial-1-1", title: "What is JavaScript?", description: "Intro to JS", objective: "Understand basics", position: 0, isFree: true, isPublished: true, courseId: "course-1" },
      { id: "tutorial-1-2", title: "Variables and Data Types", description: "Learn vars", objective: "Master variables", position: 1, isFree: false, isPublished: true, courseId: "course-1" },
      { id: "tutorial-1-3", title: "Functions in JavaScript", description: "Functions", objective: "Write functions", position: 2, isFree: false, isPublished: true, courseId: "course-1" },
      { id: "tutorial-2-1", title: "Getting Started with Next.js", description: "Setup", objective: "Init project", position: 0, isFree: true, isPublished: true, courseId: "course-2" },
      { id: "tutorial-2-2", title: "Next.js App Router", description: "Routing", objective: "Master routing", position: 1, isFree: false, isPublished: true, courseId: "course-2" },
      { id: "tutorial-3-1", title: "Introduction to Digital Art", description: "Tools", objective: "Understand art", position: 0, isFree: true, isPublished: true, courseId: "course-3" },
      { id: "tutorial-3-2", title: "Color Theory Basics", description: "Colors", objective: "Apply color theory", position: 1, isFree: false, isPublished: true, courseId: "course-3" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Tutorials seeded");

  console.log("\n🎉 Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });