"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <SignIn
  routing="path"
  path="/sign-in"
  signUpUrl="/sign-up"
  fallbackRedirectUrl="/admin/admins"
  appearance={{
    elements: {
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
    },
  }}
/>

    </div>
  );
}

