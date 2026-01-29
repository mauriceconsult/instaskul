import { InstaSkulLogo } from "@/components/instaskul-logo";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - InstaSkul",
  description:
    "Terms of Service for InstaSkul, outlining usage, content licensing, and payment policies.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center mb-6">
          <InstaSkulLogo size="sm" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
          Terms of Service
        </h1>
        
        <p className="text-gray-600 mb-8 text-center">
          Effective Date: January 29, 2025 | Version 2.0
        </p>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 mb-4">
            By accessing or using InstaSkul ("the Platform"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Platform.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            2. Intellectual Property Rights
          </h2>
          <p className="text-gray-600 mb-4">
            © 2025 InstaSkul. All rights reserved.
          </p>
          
          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            2.1 Platform Content
          </h3>
          <p className="text-gray-600 mb-4">
            All content on InstaSkul, including but not limited to the InstaSkul logo, interface
            design, graphics, and platform code, is owned by InstaSkul and protected under
            applicable copyright, trademark, and intellectual property laws.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            2.2 User-Generated Content
          </h3>
          <p className="text-gray-600 mb-4">
            Content creators (admins) retain full copyright ownership of their original courses,
            tutorials, blog posts, and other educational materials uploaded to the Platform.
          </p>
          <p className="text-gray-600 mb-4">
            By uploading content to InstaSkul, you grant InstaSkul a worldwide, non-exclusive,
            royalty-free, sublicensable, and transferable license to use, reproduce, distribute,
            prepare derivative works of, display, and perform your content in connection with
            the Platform's services.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            2.3 MIT License for Codebase
          </h3>
          <p className="text-gray-600 mb-4">
            InstaSkul's codebase is licensed under the MIT License, allowing for reuse with
            proper attribution. However, the InstaSkul brand, logo, and user-generated content
            remain protected and are not covered under this license.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            3. User Accounts and Responsibilities
          </h2>
          
          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            3.1 Account Security
          </h3>
          <p className="text-gray-600 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account. Sharing login credentials is
            strictly prohibited.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            3.2 Content Creator Obligations
          </h3>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Upload only original content or content for which you have proper rights and permissions</li>
            <li>Ensure content does not violate any copyright, trademark, or intellectual property laws</li>
            <li>Provide accurate course descriptions and pricing information</li>
            <li>Maintain professional standards in all content and communications</li>
            <li>Respond to learner inquiries in a timely manner</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            3.3 Learner Obligations
          </h3>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Use purchased content solely for personal educational purposes</li>
            <li>Do not share, distribute, or resell course materials</li>
            <li>Do not record, screenshot, or reproduce content without permission</li>
            <li>Maintain respectful communication with instructors and other learners</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            4. Payment Terms
          </h2>
          
          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            4.1 Pricing and Currency
          </h3>
          <p className="text-gray-600 mb-4">
            Course prices are set by content creators in their preferred currency: UGX (Ugandan Shilling),
            KES (Kenyan Shilling), USD (US Dollar), EUR (Euro), or GBP (British Pound).
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            4.2 Payment Methods
          </h3>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li><strong>M-Pesa (Kenya):</strong> For courses priced in KES, payment is processed through
              Safaricom's Daraja API using Lipa Na M-Pesa Online (STK Push)</li>
            <li><strong>Mobile Money (Uganda):</strong> For courses priced in UGX, payment is processed
              through MTN or Airtel Mobile Money</li>
            <li><strong>Other Currencies:</strong> Alternative payment methods for USD, EUR, and GBP</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            4.3 Payment Processing
          </h3>
          <p className="text-gray-600 mb-4">
            InstaSkul partners with trusted payment providers (Safaricom M-Pesa, MTN/Airtel Mobile Money)
            to process transactions securely. We do not store payment credentials.
          </p>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            4.4 Course Access
          </h3>
          <p className="text-gray-600 mb-4">
            Upon successful payment confirmation, learners receive immediate access to enrolled courses.
            Access is perpetual unless the course is removed by the creator or for terms violations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            5. Refund Policy
          </h2>
          
          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            5.1 Eligibility
          </h3>
          <p className="text-gray-600 mb-4">
            Refunds may be requested within 7 days of purchase if:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Course content is significantly different from the description</li>
            <li>Technical issues prevent access to the course</li>
            <li>Duplicate payment was made</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            5.2 Refund Process
          </h3>
          <p className="text-gray-600 mb-4">
            To request a refund, contact support@instaskul.com with:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Transaction ID or M-Pesa/Mobile Money confirmation code</li>
            <li>Course name and enrollment date</li>
            <li>Detailed reason for refund request</li>
          </ul>

          <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">
            5.3 Processing Time
          </h3>
          <p className="text-gray-600 mb-4">
            Approved refunds are processed within 5-7 business days. Processing fees may apply
            depending on the payment method used.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            6. Prohibited Activities
          </h2>
          <p className="text-gray-600 mb-4">
            Users are expressly prohibited from:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Uploading content that infringes on third-party intellectual property rights</li>
            <li>Distributing malware, viruses, or harmful code through the Platform</li>
            <li>Attempting to access other users' accounts or data</li>
            <li>Using the Platform for illegal activities or fraud</li>
            <li>Scraping or automated data collection from the Platform</li>
            <li>Impersonating other users or entities</li>
            <li>Harassing, threatening, or abusing other users</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-600 mb-4">
            InstaSkul is not liable for:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
            <li>Payment failures due to incorrect phone numbers, insufficient balance, or network errors</li>
            <li>Content accuracy, quality, or completeness uploaded by third-party creators</li>
            <li>User disputes regarding course content or quality</li>
            <li>Temporary service interruptions or downtime</li>
            <li>Loss of data due to user error</li>
          </ul>
          <p className="text-gray-600 mb-4">
            In no event shall InstaSkul's total liability exceed the amount paid by the user
            for the specific service in question.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            8. Privacy and Data Protection
          </h2>
          <p className="text-gray-600 mb-4">
            We collect and process personal data in accordance with applicable data protection laws.
            User data is used solely for providing Platform services, processing payments, and
            communicating Platform updates.
          </p>
          <p className="text-gray-600 mb-4">
            We do not sell or share personal data with third parties except as required for
            payment processing or legal compliance.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            9. Modifications to Terms
          </h2>
          <p className="text-gray-600 mb-4">
            InstaSkul reserves the right to modify these Terms of Service at any time. Users will be
            notified of significant changes via email or platform notifications. Continued use of
            the Platform after changes constitutes acceptance of the modified terms.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            10. Termination
          </h2>
          <p className="text-gray-600 mb-4">
            InstaSkul may suspend or terminate user accounts for violations of these Terms of Service,
            illegal activity, or abuse of the Platform. Users may terminate their accounts at any
            time by contacting support.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            11. Governing Law
          </h2>
          <p className="text-gray-600 mb-4">
            These Terms of Service are governed by the laws of Uganda. Any disputes arising from
            these terms shall be resolved through arbitration or the courts of Uganda.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            12. Contact Information
          </h2>
          <p className="text-gray-600 mb-4">
            For questions, concerns, or support regarding these Terms of Service:
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Email:</strong> <a href="mailto:support@instaskul.com" className="text-blue-600 hover:underline">support@instaskul.com</a>
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Website:</strong> <a href="https://instaskul.com" className="text-blue-600 hover:underline">instaskul.com</a>
          </p>
        </div>

        <div className="border-t pt-6 mt-8">
          <p className="text-sm text-gray-500 text-center">
            Last updated: January 29, 2025 | Version 2.0
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            © 2025 InstaSkul. All rights reserved. | <Link href="/docs" className="text-blue-600 hover:underline">User Guide & Documentation</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
