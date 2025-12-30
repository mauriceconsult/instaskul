"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstaSkulLogo } from "@/components/instaskul-logo";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6">
        <InstaSkulLogo />
      </div>
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900">
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={async () =>
              router.push(`/courses/${(await params).courseId}/pay`)
            }
            className="w-full bg-slate-800 text-white hover:bg-slate-900"
          >
            Pay with MTN MoMo
          </Button>
          <p className="text-sm text-slate-500 mt-2 text-center">
            Bank wallet option coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
