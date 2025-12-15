import Link from "next/link";
import { Metadata } from "next";
import { InstaSkulLogo } from "@/components/instaskul-logo";
import { RootAuthControls } from "@/components/auth/root-auth-controls";

export const metadata: Metadata = {
  title: "Mission and Privacy Policy",
  description:
    "Transformative knowledge management platform connecting learners and educators globally. Learn about our mission, privacy policy, and trusted partners.",
  keywords: [
    "InstaSkul",
    "Learning Management System",
    "online education",
    "digital education",
    "knowledge sharing",
    "online courses",
    "course creation",
    "admin tools",
    "teacher resources",
    "free education",
    "global learning",
    "online learning platform",
    "teaching online",
    "teaching careers",
    "employment",
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
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">
          About InstaSkul
        </h1>
        <p className="text-slate-600 mb-8 text-center">
          Learning Management Platform. Version 1.0 | October 2025.
        </p>  
       
        <p className="text-slate-600 mb-8">
          InstaSkul connects knowledge to learners through structured open sourced, online courses.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            For empowered individuals and communities.
          </li>         
          <li>
            Global reach and resources.
          </li>
          <li>
            Market driven.
          </li>
          <li>
            Public access in a safe environment for all including children.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Privacy Policy
        </h2>
        <p className="text-slate-600 mb-8">
          We do not store personal data or solicit outside our ecosystem.
          Our core system is designed for knowledge sharing without
          privacy intrusion.
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
          Admins publish their Course.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            Admin Noticeboard: Enables inline adhoc communication within the Admin.
          </li>
          <li>
            Course Noticeboard: Enables inline adhoc communication with students.
          </li>
          <li>
            Admin Analytics: Provides a detailed dashboard view of relevant data,
            including courses produced, enrollment rates, tuition fees
            received and payroll.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Transparent Pricing and Payroll
        </h3>
        <p className="text-slate-600 mb-4">
          Streamlined financial transactions:
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>
            Prompt payroll dispatches immediately upon Tuition payment.
          </li>
          <li>Platform fees at only ten percent.</li>          
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Contact and Support
        </h3>     
        <p className="text-slate-600 mb-8">
          {/* Join our community on{" "} */}        
          <Link
            href="mailto:support@instaskul.com"
            className="text-blue-600 hover:underline"
          >
            support@instaskul.com
          </Link>          
        </p>
      </div>

      <div className="fixed top-4 right-4">
        <RootAuthControls />
      </div>
    </div>
  );
};
