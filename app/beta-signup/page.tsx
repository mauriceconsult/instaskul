// app/beta-signup/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function BetaSignUpPage() {
  const router = useRouter();
  const [betaCode, setBetaCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message: string;
    type?: string;
    email?: string;
  } | null>(null);

  const validateCode = async () => {
    if (!betaCode) return;

    setValidating(true);
    try {
      const response = await axios.post("/api/beta/validate", {
        code: betaCode,
      });

      setValidation({
        valid: true,
        message: `Welcome to the beta program, ${response.data.type.toLowerCase()}!`,
        type: response.data.type,
        email: response.data.email,
      });
    } catch (error: any) {
      setValidation({
        valid: false,
        message: error.response?.data?.error || "Invalid beta code",
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <h1 className="text-3xl font-bold">Instaskul Beta Program</h1>
          </div>
          <p className="text-gray-600">
            Exclusive early access for selected educators and students
          </p>
        </div>

        {/* Beta Code Validation */}
        {!validation?.valid && (
          <div className="bg-white rounded-lg shadow-lg border p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Enter Your Beta Code</h2>
              <p className="text-sm text-gray-600">
                Check your email for your personal invitation code
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="BETA-EDU-XXXXXXXX"
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={validateCode}
                disabled={validating || !betaCode}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {validating ? "Validating..." : "Validate"}
              </button>
            </div>

            {validation && !validation.valid && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm text-red-800">{validation.message}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">
                Don't have a beta code?{" "}
                <button
                  onClick={() => router.push("/sign-up")}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up for general access
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Beta Perks Display */}
        {validation?.valid && (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <svg className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-green-800">{validation.message}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-900 mb-4">Your Beta Perks</h3>
              <div className="space-y-3">
                {[
                  "Free platform access (Feb 1-28, 2026)",
                  "Priority support (24-hour response)",
                  "Early payout access (March 7, 2026)",
                  "Shape product roadmap with feedback",
                  "Beta tester badge on profile"
                ].map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-purple-800">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clerk Signup Component */}
            <div className="bg-white rounded-lg shadow-xl">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "shadow-none border-0",
                  },
                }}
                unsafeMetadata={{
                  betaCode: betaCode,
                  betaType: validation.type,
                  isBetaTester: true,
                }}
                afterSignUpUrl="/dashboard"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}