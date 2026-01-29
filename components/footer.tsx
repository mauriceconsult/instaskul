import Link from "next/link";
import { BookOpen, Mail, FileText } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t py-8 text-slate-600 md:pl-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main content */}
        <div className="text-center mb-6">
          <p className="text-sm leading-relaxed mb-4">
            Courses in <span className="font-medium">Engineering & Technology</span>,{" "}
            <span className="font-medium">Education</span>,{" "}
            <span className="font-medium">Arts & Humanities</span>,{" "}
            <span className="font-medium">Social & Natural Sciences</span>,{" "}
            <span className="font-medium">Business & Management</span>, and{" "}
            <span className="font-medium">Sports & Fitness</span>.
          </p>
          
          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Read Our Blog
            </Link>
            
            <span className="text-slate-300">|</span>
            
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FileText className="h-4 w-4" />
              User Guide
            </Link>
            
            <span className="text-slate-300">|</span>
            
            <Link
              href="/about"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              About InstaSkul
            </Link>
            
            <span className="text-slate-300">|</span>
            
            <Link
              href="/terms"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 mb-4"></div>

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p className="text-slate-500">
            © {currentYear} Max18tech Company Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a
              href="mailto:support@instaskul.com"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Support</span>
            </a>
            
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Latest Articles
            </Link>
          </div>
        </div>

        {/* Optional: Social media icons can be added here */}
      </div>
    </footer>
  );
}
