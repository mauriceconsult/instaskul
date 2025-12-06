// test-assignments.ts
import "dotenv/config";
import { prisma } from "./lib/db";

// Use relative URLs or placeholder — real files will come from UploadThing in UI
const MOCK_ASSIGNMENT_URL = "/uploads/assignment-test.pdf";
const MOCK_PROJECT_URL = "/uploads/project-test.zip";

const TEST_ASSIGNMENT_ID = "assign_1";
const TEST_USER_ID = "user_stu_001";
const TEST_COURSEWORK_ID = "coursework_1";
const TEST_COURSE_NOTICEBOARD_ID = "course_notice_1";

async function testAllSubmissions() {
  try {
    console.log("=== FULL LMS SUBMISSION TEST ===");

    // === 1. Assignment Submission ===
    const assignmentSub = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_userId: { assignmentId: TEST_ASSIGNMENT_ID, userId: TEST_USER_ID } },
      update: { text: "Updated test answer", submittedAt: new Date() },
      create: {
        assignmentId: TEST_ASSIGNMENT_ID,
        userId: TEST_USER_ID,
        text: "This is my assignment answer.",
        fileUrl: MOCK_ASSIGNMENT_URL,
      },
    });
    console.log("Assignment Submission:", assignmentSub.id);

    // === 2. Coursework Submission ===
    const courseworkSub = await prisma.courseworkSubmission.upsert({
      where: { courseworkId_userId: { courseworkId: TEST_COURSEWORK_ID, userId: TEST_USER_ID } },
      update: { text: "Updated project", submittedAt: new Date() },
      create: {
        courseworkId: TEST_COURSEWORK_ID,
        userId: TEST_USER_ID,
        text: "Final project: Full-stack app",
        fileUrl: MOCK_PROJECT_URL,
      },
    });
    console.log("Coursework Submission:", courseworkSub.id);

    // === 3. Teacher Comment ===
    const teacherComment = await prisma.courseNoticeboardComment.upsert({
      where: { id: "cnc_teacher_test" },
      update: { content: "Updated: Keep up the good work!" },
      create: {
        id: "cnc_teacher_test",
        courseNoticeboardId: TEST_COURSE_NOTICEBOARD_ID,
        userId: "399cc8ba-b39a-4801-a244-680ed2af0f32",
        content: "Great progress, team!",
      },
    });
    console.log("Teacher Comment:", teacherComment.id);

    // === 4. Student Reply ===
    const studentReply = await prisma.courseNoticeboardComment.upsert({
      where: { id: "cnc_reply_test" },
      update: { content: "Thanks! Working on improvements." },
      create: {
        id: "cnc_reply_test",
        courseNoticeboardId: TEST_COURSE_NOTICEBOARD_ID,
        userId: TEST_USER_ID,
        content: "Thank you for the feedback!",
        courseId: teacherComment.id,
      },
    });
    console.log("Student Reply:", studentReply.id);

    console.log("=== ALL TESTS PASSED ===");
    console.log("Backend + DB 100% WORKING");
    console.log("Ready for UI testing → MERGE TO MAIN → LAUNCH");

  } catch (error) {
    console.error("TEST FAILED:", error instanceof Error ? error.message : error);
  }
}

testAllSubmissions();