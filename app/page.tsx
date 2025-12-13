import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-5xl font-bold text-gray-900">
        Welcome to Instaskul
      </h1>

      <p className="text-xl text-gray-600 max-w-2xl text-center">
        Your comprehensive knowledge management solution for schools and tutors.
      </p>

      <div className="flex gap-6 mt-8">
        {/* Sign In */}
        <Link href="/sign-in">
          <button className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
        </Link>

        {/* Sign Up */}
        <Link href="/sign-up">
          <button className="px-8 py-4 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}
