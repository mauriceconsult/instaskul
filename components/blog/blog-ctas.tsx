"use client";
// components/blog/blog-ctas.tsx
// Ready-to-use CTA components for blog posts

"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, BookOpen, Download, Sparkles } from "lucide-react";

// ============================================
// 1. End of Post CTA
// ============================================
export function EndOfPostCTA() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="my-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <h3 className="text-2xl font-bold mb-4">Explore More Courses</h3>
        <p className="text-slate-600 mb-6">
          Continue your learning journey with our curated course library
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Browse Courses
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="my-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
      <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600" />
      <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
      <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
        Join InstaSkul today and get access to premium courses, expert instructors, 
        and a community of learners from across East Africa.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/sign-up"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Free Account
          <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center justify-center gap-2 px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          Browse Courses
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

// ============================================
// 2. Inline Course Recommendation CTA
// ============================================
interface CourseRecommendationProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseImage?: string;
  coursePrice: string;
  courseCurrency: string;
}

export function CourseRecommendationCTA({
  courseId,
  courseTitle,
  courseDescription,
  courseImage,
  coursePrice,
  courseCurrency,
}: CourseRecommendationProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="my-8 border-2 border-blue-100 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-blue-600">Related Course</span>
      </div>
      <div className="flex gap-4">
        {courseImage && (
          <img
            src={courseImage}
            alt={courseTitle}
            className="w-24 h-24 rounded object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2">{courseTitle}</h4>
          <p className="text-sm text-slate-600 mb-3">{courseDescription}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-600">
              {courseCurrency} {coursePrice}
            </span>
            <Link
              href={isSignedIn ? `/courses/${courseId}` : `/sign-up?course=${courseId}`}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              {isSignedIn ? "View Course" : "Enroll Now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 3. Lead Magnet / Download CTA
// ============================================
interface LeadMagnetProps {
  title: string;
  description: string;
  downloadUrl?: string;
  icon?: string;
}

export function LeadMagnetCTA({
  title,
  description,
  downloadUrl,
  icon = "📚",
}: LeadMagnetProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="my-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-100">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-2">{title}</h4>
          <p className="text-slate-600 mb-4">{description}</p>
          <Link
            href={isSignedIn && downloadUrl ? downloadUrl : `/sign-up?download=${title}`}
            className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
          >
            <Download className="h-4 w-4" />
            {isSignedIn ? "Download Now" : "Sign Up to Download"}
          </Link>
          {!isSignedIn && (
            <p className="mt-3 text-xs text-slate-500">
              Create a free account to access this and other exclusive resources
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. Inline Sign-Up Nudge
// ============================================
export function InlineSignUpNudge({ message }: { message?: string }) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return null;

  return (
    <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
      <p className="text-sm text-slate-700">
        💡 <strong>Quick tip:</strong>{" "}
        {message || "Sign up to save your progress and access premium content."}
        {" "}
        <Link href="/sign-up" className="text-blue-600 font-semibold hover:underline">
          Create free account →
        </Link>
      </p>
    </div>
  );
}

// ============================================
// 5. Sticky Bottom Bar CTA (appears after scrolling)
// ============================================
// "use client";

import { useEffect, useState } from "react";

export function StickyBottomCTA() {
  const { isSignedIn } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 50% down the page
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setShow(scrollPercent > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isSignedIn || !show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 animate-slide-up">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Enjoying this article?</p>
          <p className="text-sm text-slate-600">Join InstaSkul for more educational content</p>
        </div>
        <Link
          href="/sign-up"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap"
        >
          Sign Up Free
        </Link>
      </div>
    </div>
  );
}

// ============================================
// 6. Social Proof CTA
// ============================================
interface TestimonialCTAProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
}

export function TestimonialCTA({ quote, author, role, avatar }: TestimonialCTAProps) {
  const { isSignedIn } = useAuth();

  return (
    <div className="my-8 bg-slate-50 border-l-4 border-green-500 p-6 rounded-r-lg">
      <p className="italic text-slate-700 mb-4">"{quote}"</p>
      <div className="flex items-center gap-3 mb-4">
        {avatar ? (
          <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-slate-600">{role}</p>
        </div>
      </div>
      {!isSignedIn && (
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
        >
          Start Your Journey
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
