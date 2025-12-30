import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t py-6 text-center text-gray-500 text-sm md:pl-80">
      <p className="px-4 mb-2">
        Courses in Engineering & Technology, Education, Arts & Humanities, Social & Natural
        Sciences, Business & Management, and Sports & Fitness.{" "}
        <Link href="/about" className="text-blue-600 hover:underline">
          Learn more
        </Link>
        .
      </p>
      <p className="italic text-sm">© 2025 Max18tech company ltd. All rights reserved.</p>
    </footer>
  );
}