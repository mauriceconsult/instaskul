// app/docs/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Mail, Twitter, Facebook, Linkedin, Instagram } from "lucide-react";
import { InstaSkulLogo } from "@/components/instaskul-logo";

export const metadata: Metadata = {
  title: "InstaSkul User Guide and Documentation",
  description: "Comprehensive documentation for InstaSkul transformative Learning Management System.",
  keywords: [
    "InstaSkul",
    "Learning Management System",
    "online education",
    "digital education",
    "knowledge sharing",
    "e-learning",
    "M-Pesa payments",
    "multi-currency",
    "blog",
    "education",
  ],
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center mb-6">
          <InstaSkulLogo size="md" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">
          InstaSkul User Guide
        </h1>
        <p className="text-slate-600 mb-8 text-center">
          Learning Management Platform. Version 2.0 | January 2025
        </p>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Introduction
        </h2>
        <p className="text-slate-600 mb-8">
          Welcome to InstaSkul, a comprehensive platform designed to connect educators and
          learners through engaging online courses. This document provides a
          complete guide for using the platform and outlines the Terms of Use to
          protect our content and ensure a fair, professional experience for all
          users.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          About InstaSkul
        </h3>    

        <p className="text-slate-600 mb-8">
          InstaSkul enables educators to build and share educational courses,
          while learners can enroll, track progress, and complete tutorials. Our
          platform is accessible on web and mobile, with secure payment processing
          through M-Pesa (for Kenya) and Mobile Money (for Uganda), supporting
          multiple currencies including UGX, KES, USD, EUR, and GBP.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          What's New in Version 2.0
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li><strong>Multi-Currency Support:</strong> Set course prices in UGX, KES, USD, EUR, or GBP</li>
          <li><strong>M-Pesa Integration:</strong> Seamless payment processing via Safaricom Daraja API for Kenyan users</li>
          <li><strong>Blog Platform:</strong> Share educational articles and insights with rich text editing</li>
          <li><strong>Enhanced Payment Flow:</strong> Real-time payment status tracking and confirmations</li>
          <li><strong>Improved Content Creation:</strong> Advanced rich text editor with multimedia support</li>
          <li><strong>AI-Powered Content Generation:</strong> Course creators can now generate course content, voices, and tutorials directly from the course page using the Generate Content button, powered by Studio AI</li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Purpose of This Document
        </h3>
        <p className="text-slate-600 mb-8">
          This guide helps educators and learners navigate InstaSkul's features.
          The Terms of Use section ensures proper use and protects intellectual
          property.
        </p>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          User Guide for Educators
        </h2>
        <p className="text-slate-600 mb-4">
          This section explains how educators can set up and manage courses on
          InstaSkul. A new admin setup requires: admin title, school of
          specialization, description, cover image, and optional supporting
          materials. You must create at least one Course under the Admin before
          publishing. Each Course must have at least a Tutorial and a Coursework
          before it can be published. Each Tutorial should have an assignment for
          students to submit upon completion.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Navigating the Admin Interface
        </h3>
        <p className="text-slate-600 mb-4">
          The admin is your organizational space to embark on Course
          creation and management. If you are an organization, such as an
          education institution or a company, you can create multiple admins
          to suit your organization's Faculties or Departments. InstaSkul
          facilitates continuous improvement allowing you to create and produce
          Courses at your own pace and publish only when you are ready. You can also
          unpublish your works. You maintain the copyright to your content.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            Access Dashboard: Navigate to the Admin Dashboard from the sidebar.
          </li>
          <li>
            Click on create admin and give a title to your admin. This will be
            your admin's brand. You can, if necessary, change it.
          </li>
          <li>This enables you to navigate to your admin.</li>
          <li>
            Inside your admin select your school of specialization from the
            dropdown, e.g., Science, Arts, Business, etc.
          </li>
          <li>
            In the description, provide the necessary metadata, i.e., a brief
            updated description of your admin.
          </li>
          <li>Upload admin's cover image.</li>
          <li>
            If and when necessary, provide supporting materials in the form of
            PDFs, videos, text or images.
          </li>
          <li>
            Use the admin noticeboard to communicate with your Faculty or
            Department when and if necessary.
          </li>
          <li>
            Course creation begins inside the Admin when you create a Course with a
            title. This enables the edit link that navigates to the course page.
          </li>
          <li>
            At least one published Course is required before you can publish your Admin.
            You can continue adding more Courses to the admin as necessary.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Navigating the Course Interface
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            The course page enables you to develop Course(s) in your Admin. Each
            Course you create is identified with your admin.
          </li>
          <li>
            The Course title and Admin - to which the Course belongs - are
            already indicated as you set them in the admin page. You can edit any or
            both of them if necessary.
          </li>
          <li>
            Provide a brief updated description of your Course to attract and
            inform your visitors about the Course.
          </li>
          <li>Upload the course cover image.</li>
          <li>
            <strong>Set Your Course Price:</strong> Fill in the course amount and select your preferred
            currency (UGX, KES, USD, EUR, or GBP). This will be used for checkout.
          </li>
          <li>
  <strong>Generate Content with AI:</strong> Use the <em>Generate Content</em> button on the course 
  page to launch Studio, InstaSkul's AI workspace. From there you can generate course outlines, 
  tutorial scripts, and AI voices to accelerate your content creation.
</li>
<li>
  <strong>Responsible AI Use:</strong> AI-generated content is a starting point, not a finished 
  product. You are responsible for reviewing, editing, and verifying all generated material before 
  publishing. Ensure accuracy, originality, and alignment with your course objectives. InstaSkul 
  is not liable for the quality or accuracy of AI-generated content.
</li>
          <li>
            <strong>Payment Methods:</strong> Kenyan courses (KES) support M-Pesa payments.
            Ugandan courses (UGX) support Mobile Money. Other currencies use standard payment processing.
          </li>
          <li>
            Consider breaking your Course into multiple Tutorials, e.g.,
            Tutorial 1: Introduction; Tutorial 2: Basics, etc.
          </li>
          <li>
            You can add support materials (when and if necessary) in the form of
            PDFs, videos, text or images.
          </li>
          <li>
            Communicate internally with your students when and if necessary,
            through Course notices.
          </li>
          <li>Give a coursework to be submitted at Course completion.</li>
          <li>
            Tutorial creation begins here when you give your tutorial a title.
            This enables an edit link to navigate to the Tutorial page.
          </li>
          <li>
            You must first publish at least one Tutorial before you can publish
            a Course. Afterwards you can continue adding more Tutorials.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Navigating the Tutorial Interface
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            The tutorial page enables you to specialize on an individual lesson
            in the corresponding Course.
          </li>
          <li>
            The Course and Admin to which the Tutorial belongs are already
            indicated. You can change any or both of them if necessary.
          </li>
          <li>
            Provide the Tutorial's objective(s). NOTE: Ensure that you set and
            achieve the objective(s) within the limited Tutorial span.
          </li>
          <li>
            Consider breaking down multiple objectives into multiple Tutorials
            rather than cramming them in one Tutorial.
          </li>
          <li>
            For Tutorial videos you can save your PowerPoint or Google Slides
            presentations as videos and upload them as Tutorials.
          </li>
          <li>
            You can also attach additional details (when and if necessary) in
            the form of PDFs, videos, text or images.
          </li>
          <li>
            Ensure that each Tutorial is accompanied by a published assignment for
            students to submit upon watching the Tutorial.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Managing Tutorials
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            Edit Content: From the course page, edit tutorial titles, content,
            or order (via "position" field).
          </li>
          <li>
            Track Progress: Monitor learner enrollment and progress via the
            dashboard analytics.
          </li>
          <li>
            Set Free/Locked: Mark tutorials as free or locked (requires
            enrollment) in the tutorial settings.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Blog Management
        </h3>
        <p className="text-slate-600 mb-4">
          InstaSkul now includes a powerful blog platform for sharing educational content,
          insights, and updates with your audience.
        </p>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            <strong>Create Blog Posts:</strong> Access the blog section from your admin dashboard.
            Create posts with titles, rich text content, cover images, and excerpts.
          </li>
          <li>
            <strong>Rich Text Editor:</strong> Use the advanced editor to format text, add images,
            create lists, insert links, and style your content professionally.
          </li>
          <li>
            <strong>Categorize Content:</strong> Add categories and tags to organize your posts
            and make them discoverable.
          </li>
          <li>
            <strong>Publishing Control:</strong> Save posts as drafts or publish immediately.
            You can unpublish or edit posts at any time.
          </li>
          <li>
            <strong>SEO-Friendly:</strong> Add excerpts that appear in search results and social
            media previews to attract more readers.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Publishing Your Content
        </h3>
        <p className="text-slate-600 mb-4">
          Note: When publishing your first admin, your first Admin publishing will begin at
          the Assignment page, then use the backlink (at the top of the page) to
          navigate to the associated Tutorial, Course through to Admin, publishing each of them. 
          You now have a published Course under your Admin. You can then continue adding 
          Courses and Tutorials as necessary. You can publish multiple admins to suit your organization.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Best Practices
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li>Use clear, concise titles and descriptions.</li>
          <li>Ensure content is original to avoid copyright issues.</li>
          <li>Test tutorials for accessibility on mobile and web.</li>
          <li>Use landscape mode to capture images and videos for better viewing experience.</li>
          <li>Choose the appropriate currency for your target audience's location.</li>
          <li>Review all AI-generated content carefully before publishing — treat it as a first draft that requires your professional judgment.</li>
<li>Use AI generation to accelerate structure and scripting, but ensure your voice and expertise shape the final material.</li>
          <li>Regularly update blog posts to keep your audience engaged.</li>
          <li>Use high-quality cover images that are relevant to your content.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          User Guide for Learners
        </h2>
        <p className="text-slate-600 mb-4">
          This section guides learners on enrolling in and navigating courses.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Enrolling in a Course
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            <strong>Browse Courses:</strong> Explore available courses on the platform,
            filtered by category, admin, or search.
          </li>
          <li>
            <strong>View Pricing:</strong> Each course displays its price in the set currency
            (UGX, KES, USD, EUR, or GBP).
          </li>
          <li>
            <strong>Enroll:</strong> Click a course, then select "Enroll" to proceed to payment.
          </li>
          <li>
            <strong>Payment Options:</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>For KES courses: Pay via M-Pesa using your Safaricom number (e.g., 0712345678 or 254712345678)</li>
              <li>For UGX courses: Pay via Mobile Money using your MTN/Airtel number (e.g., 256123456789)</li>
              <li>Other currencies: Use standard payment methods</li>
            </ul>
          </li>
          <li>
            <strong>Confirm Enrollment:</strong> After successful payment, the course appears in your
            dashboard and all tutorials unlock.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          M-Pesa Payment Process (Kenya - KES)
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>Click "Pay with M-Pesa" on the course enrollment page</li>
          <li>Enter your Safaricom M-Pesa number (e.g., 0712345678)</li>
          <li>Click "Pay Now" to initiate the payment</li>
          <li>You will receive an M-Pesa prompt on your phone</li>
          <li>Enter your M-Pesa PIN to complete the payment</li>
          <li>Wait for confirmation - you'll be automatically redirected once payment is successful</li>
          <li>Check your M-Pesa messages for the transaction confirmation</li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Navigating Courses
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            Access Sidebar: On desktop, view the sidebar at{" "}
            instaskul.com/courses/[courseId]. On mobile, tap the menu icon to
            open it.
          </li>
          <li>
            View Tutorials: Click tutorial titles to access content. Locked
            tutorials require enrollment and payment.
          </li>
          <li>
            Track Progress: Check completion status (checkmark for completed,
            play icon for in-progress) and overall progress percentage in the
            sidebar.
          </li>
          <li>
            Submit Assignments: Complete tutorial assignments to track your learning progress.
          </li>
          <li>
            View Course Materials: Access additional PDFs, videos, and resources provided by instructors.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Reading Blog Posts
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>Access the blog section to read educational articles and updates</li>
          <li>Browse posts by category or tags to find topics of interest</li>
          <li>Share posts on social media to spread knowledge</li>
          <li>Subscribe to stay updated on new content</li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Payment Instructions
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-8 space-y-2">
          <li><strong>M-Pesa (Kenya):</strong> Use a valid Safaricom number (07XXXXXXXX or 2547XXXXXXXX)</li>
          <li><strong>Mobile Money (Uganda):</strong> Use a valid 12-digit MSISDN (256XXXXXXXXX)</li>
          <li>Ensure you have sufficient balance before initiating payment</li>
          <li>After payment, tutorials unlock automatically</li>
          <li>Keep your transaction ID for reference</li>
          <li>Contact support if payment was deducted but course didn't unlock: support@instaskul.com</li>
        </ul>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Terms of Use
        </h2>
        <p className="text-slate-600 mb-4">
          By using InstaSkul, you agree to these Terms of Use, which protect our
          intellectual property and ensure a fair platform experience.
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Copyright and Intellectual Property
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            All content on InstaSkul, including courses, tutorials, blog posts, and the
            InstaSkul logo, is owned by InstaSkul or its creators and protected
            by copyright law.
          </li>
          <li>
            Users may not reproduce, distribute, or modify content without
            written permission from InstaSkul or the content creator.
          </li>
          <li>
            Admins retain ownership of their course content and blog posts but grant InstaSkul
            a non-exclusive, worldwide, royalty-free license to host and display it.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          User Responsibilities
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>
            <strong>Admins:</strong> Must upload original content and comply with copyright laws.
            InstaSkul is not liable for user-generated content violations.
          </li>
          <li>
  <strong>AI-Generated Content:</strong> Admins using the Generate Content feature are solely 
  responsible for reviewing and validating AI output before publishing. Content must meet 
  InstaSkul's quality standards and comply with copyright and accuracy requirements.
</li>
          <li>
            <strong>Learners:</strong> Must use content for personal learning only. Sharing login
            credentials or course materials is prohibited.
          </li>
          <li>
            <strong>Payment Processing:</strong> Users are responsible for ensuring payment details
            are correct. InstaSkul partners with M-Pesa and Mobile Money for secure transactions.
          </li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Payment and Refund Policy
        </h3>
        <ul className="list-disc list-inside text-slate-600 mb-4 space-y-2">
          <li>All payments are processed securely through M-Pesa (Kenya) or Mobile Money (Uganda)</li>
          <li>Course access is granted immediately upon successful payment confirmation</li>
          <li>Refunds may be requested within 7 days of purchase if course content is not as described</li>
          <li>Refund requests must be submitted to support@instaskul.com with transaction details</li>
          <li>Processing fees may apply to refunds depending on payment method</li>
        </ul>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Limitations of Liability
        </h3>
        <p className="text-slate-600 mb-8">
          InstaSkul is not responsible for payment issues due to invalid phone numbers,
          insufficient balance, or network errors. We partner with trusted payment providers
          (Safaricom M-Pesa, MTN/Airtel Mobile Money) for secure transactions. For payment issues,
          contact support: support@instaskul.com
        </p>

        <h3 className="text-xl font-medium text-slate-800 mb-2">
          Platform Updates and Changes
        </h3>
        <p className="text-slate-600 mb-8">
          InstaSkul reserves the right to update features, pricing structures, and payment methods.
          Users will be notified of significant changes via email or platform notifications.
        </p>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Contact & Support
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <p className="text-slate-600 mb-4">
            For questions, support, or feedback, reach out to us:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="h-5 w-5 text-blue-600" />
              <a href="mailto:support@instaskul.com" className="hover:text-blue-600 transition-colors">
                support@instaskul.com
              </a>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Stay Connected
        </h2>
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <p className="text-slate-600 mb-4">
            Follow us on social media for updates, tips, and educational content:
          </p>
          <div className="flex flex-wrap gap-4">
            <a 
              href="https://x.com/insta_skul" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              <span className="font-medium">X (Twitter)</span>
            </a>
            <a 
              href="https://www.facebook.com/mauriceconsulat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Facebook className="h-5 w-5" />
              <span className="font-medium">Facebook</span>
            </a>
            <a 
              href="https://www.linkedin.com/company/instaskul" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              <span className="font-medium">LinkedIn</span>
            </a>
            <a 
              href="https://www.instagram.com/insta_skul" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="font-medium">Instagram</span>
            </a>
          </div>
        </div>

        <div className="border-t pt-6 mt-12">
        <p className="text-sm text-slate-500 text-center">
  Last updated: {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} | Version 2.1
</p>
          <p className="text-sm text-slate-500 text-center mt-2">
            © 2025 InstaSkul. All rights reserved. | <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
