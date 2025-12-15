import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InstaSkulLogo } from "@/components/instaskul-logo";

export default async function HomePage() {
  const { userId } = await auth();
  
  // If user is already signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-5xl font-bold text-gray-900">
        <span>
          <InstaSkulLogo/>
        </span>
         Knowledge Management Simplified        
      </h1>

      <p className="text-xl text-gray-600 max-w-2xl text-center">
        knowledge managers, schools and freelance tutors.
      </p>

      <div className="flex gap-6 mt-8">
        <Link
          href="/sign-in"
          className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="px-8 py-4 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition"
        >
          Get Started
        </Link>
      </div>
    </main>
  );
}
