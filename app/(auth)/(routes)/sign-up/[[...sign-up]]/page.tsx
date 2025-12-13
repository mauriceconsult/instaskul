"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignUp
  routing="path"
  path="/sign-up"
  signInUrl="/sign-in"
  fallbackRedirectUrl="/admin"
  appearance={{
    elements: {
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
      card: "shadow-2xl rounded-xl",
      headerTitle: "text-3xl font-bold text-gray-800",
    },
  }}
/>

    </div>
  );
}