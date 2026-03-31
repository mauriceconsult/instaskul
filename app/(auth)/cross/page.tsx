/**
 * app/auth/cross/page.tsx  (instaskul version)
 * Redeems a manager cross-app token and redirects into instaskul.
 * Mirror of studio's /auth/cross page.
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const PLATFORM_API_URL = process.env.PLATFORM_API_URL ?? "http://localhost:4000";
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY ?? "";

interface Props {
  searchParams: { token?: string; courseId?: string };
}

export default async function CrossAuthPage({ searchParams }: Props) {
  const { token, courseId } = searchParams;

  if (!token) {
    redirect("/sign-in?error=missing_token");
  }

  // Already signed in — go straight to destination
  const { userId } = await auth();
  if (userId) {
    redirect(courseId ? `/courses/${courseId}` : "/dashboard");
  }

  // Redeem token
  try {
    const res = await fetch(`${PLATFORM_API_URL}/api/sessions/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify({ token, targetApp: "instaskul" }),
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/sign-in?error=invalid_token");
    }

    const platformUser = await res.json();

    const signInParams = new URLSearchParams({
      redirect_url: courseId ? `/courses/${courseId}` : "/dashboard",
    });

    if (platformUser?.email) {
      signInParams.set("identifier", platformUser.email);
    }

    redirect(`/sign-in?${signInParams.toString()}`);
  } catch {
    redirect("/sign-in?error=token_error");
  }
}
