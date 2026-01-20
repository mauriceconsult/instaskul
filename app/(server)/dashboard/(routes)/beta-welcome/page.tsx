// app/(dashboard)/(routes)/beta-welcome/page.tsx

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BetaWelcomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">🎉 Welcome to Instaskul Beta!</h1>
        <p className="text-xl text-muted-foreground">
          You're one of our first 20 beta testers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Join our WhatsApp Beta Group</p>
                <p className="text-sm text-muted-foreground">
                  Get instant support and share feedback
                </p>
                <Link href="https://chat.whatsapp.com/XXXXX" target="_blank">
                  <Button variant="link" className="px-0">
                    Join WhatsApp Group →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Complete Your Profile</p>
                <p className="text-sm text-muted-foreground">
                  Help us understand your needs better
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Attend Kickoff Call</p>
                <p className="text-sm text-muted-foreground">
                  Tomorrow, Jan 21 at 10am (30 minutes)
                </p>
                <Link href="https://meet.google.com/xxxxx" target="_blank">
                  <Button variant="link" className="px-0">
                    Add to Calendar →
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Start Testing</p>
                <p className="text-sm text-muted-foreground">
                  Explore the platform and share your thoughts
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full" size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">We Need Your Feedback!</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p>
            Over the next 2 weeks, we'll ask for your input on:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Ease of use (navigation, course creation, payments)</li>
            <li>Feature requests (what's missing?)</li>
            <li>Bugs and issues (what's broken?)</li>
            <li>Overall experience (would you recommend us?)</li>
          </ul>
          <p className="mt-4">
            Your honest feedback shapes Instaskul's future. Thank you! 🙏
          </p>
        </CardContent>
      </Card>
    </div>
  );
}