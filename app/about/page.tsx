import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { InstaSkulLogo } from "@/components/instaskul-logo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About InstaSkul - Our Mission and Privacy Policy",
  description:
    "Learn about InstaSkul's mission to transform education and our commitment to user privacy.",
  keywords: [
    "InstaSkul",
    "Learning Management System",
    "online education",
    "digital education",
    "knowledge sharing",
    "e-learning",
    "education",
    "privacy policy",
  ],
};

export default function AboutPage() {
 return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <InstaSkulLogo size="md" />

          {/* Exit button */}
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit
            </Button>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">
          About InstaSkul
        </h1>
        <p className="text-slate-600 mb-8 text-center">
          Learning Management Platform. Version 1.0 | October 2025.
        </p>
        <Image
          src="/adminImage.png"
          alt="InstaSkul Admin"
          width={800}
          height={400}
        />
       
        <p className="text-slate-600 mb-8">
          InstaSkul is dedicated to transforming education by connecting educators
          and learners through structured, impactful online courses. We believe:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            Knowledge and skills as means and an ends for empowered
            individuals and communities.
          </li>         
          <li>
            Global-spanning classrooms expand the reach of teachers
            and resources worldwide.
          </li>
          <li>
            Access to a wide selection of structured content from
            the best global educators.
          </li>
          <li>
            Education must be practical, transformative, and able to withstand
            public scrutiny in a dynamic global knowledge landscape.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Privacy Policy
        </h2>
        <p className="text-slate-600 mb-8">
          At InstaSkul, we prioritize your privacy. We neither store personal data
          beyond what’s necessary nor conduct solicitation outside our ecosystem.
          Our core system is designed for productive knowledge sharing with
          minimal privacy intrusion—only your username is required.
        </p>
        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Our Trusted Partners
        </h3>
        <p className="text-slate-600 mb-4">
          We work with respected service providers to ensure a secure and seamless
          experience:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>Your account is secured by Clerk at sign-in.</li>
          <li>Tuition fee payments and admin payroll are powered by MTN MoMo.</li>
          <li>Tutorial videos powered by Mux Video.</li>
          <li>Images powered by Uploadthing.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          How InstaSkul Works
        </h2>
        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Admin and Course Creation
        </h3>
        <p className="text-slate-600 mb-4">
          InstaSkul’s Admins undergo a rigorous course-creation-based screening
          process for building transformative courses.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            Admin Noticeboard: Enables direct communication with course
            producer(s) as needed.
          </li>
          <li>
            Course Noticeboard: Facilitates direct communication between course
            producers and students when necessary.
          </li>
          <li>
            Admin Analytics: Provides a detailed dashboard view of relevant data,
            including courses produced, enrollment rates, and tuition fees
            received.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Transparent Pricing and Payroll
        </h3>
        <p className="text-slate-600 mb-4">
          InstaSkul ensures transparency in all financial transactions:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            Admin payroll dispatches payments based on available balances via MTN
            MoMo after statutory deductions (Value Added Tax) and a 10% platform
            fee.
          </li>
          <li>No hidden fees for users.</li>
          <li>
            Admins can upgrade to install their own fee receipt, payroll, and
            academic certification systems within InstaSkul upon meeting statutory
            and commercial requirements.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Continuous Improvement
        </h3>
        <p className="text-slate-600 mb-8">
          InstaSkul maintains and updates the learning system at no extra cost,
          ensuring a reliable and cutting-edge platform for all users.
        </p>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Contact and Support
        </h2>
        <p className="text-slate-600 mb-8">
          Join our community on{" "}
          {/* <Link
            href="https://x.com/instaskul"
            className="text-blue-600 hover:underline"
          >
            X
          </Link> */}
          {/* ,{" "}
          <Link
            href="https://linkedin.com/company/instaskul"
            className="text-blue-600 hover:underline"
          >
            LinkedIn
          </Link>
          ,{" "}
          <Link
            href="https://discord.gg/instaskul"
            className="text-blue-600 hover:underline"
          >
            Discord
          </Link>
          ,{" "}
          <Link
            href="https://whatsapp.com/channel/instaskul"
            className="text-blue-600 hover:underline"
          >
            WhatsApp
          </Link>
          , or{" "}
          <Link
            href="https://facebook.com/instaskul"
            className="text-blue-600 hover:underline"
          >
            Facebook
          </Link>
          . Contact us at{" "} */}
          <Link
            href="mailto:support@instaskul.com"
            className="text-blue-600 hover:underline"
          >
            support@instaskul.com
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
