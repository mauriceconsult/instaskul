import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user already has an admin account
  const existingAdmin = await prisma.admin.findFirst({
    where: {
      userId: userId,
    },
    include: {
      school: true,
    }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600">Manage your admin account and school settings</p>
      </div>

      {existingAdmin ? (
        /* User already has an admin account */
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Admin Account</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Title:</span> {existingAdmin.title}</p>
              {existingAdmin.description && (
                <p><span className="font-medium">Description:</span> {existingAdmin.description}</p>
              )}
              {existingAdmin.school && (
                <p><span className="font-medium">School:</span> {existingAdmin.school.name}</p>
              )}
              <p><span className="font-medium">Status:</span> {' '}
                <span className={existingAdmin.isPublished ? "text-green-600" : "text-yellow-600"}>
                  {existingAdmin.isPublished ? "Published" : "Draft"}
                </span>
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <Link
                href={`/admin/admins/${existingAdmin.id}/edit`}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Admin Profile
              </Link>
              <Link
                href={`/admin/admins/${existingAdmin.id}/courses`}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                Manage Courses
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* User does not have an admin account yet */
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">No Admin Account Found</h2>
            <p className="text-gray-600">
              You need to create an admin account to access the admin panel and manage courses.
            </p>
          </div>

          <Link
            href="/admin/admins/create"
            className="inline-block px-8 py-4 bg-slate-600 text-white text-lg font-medium rounded-lg hover:bg-slate-700 transition"
          >
            Create Admin Account
          </Link>
        </div>
      )}
    </div>
  );
}
