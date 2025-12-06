import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PayrollClient from "./payroll-client";

export default async function PayrollPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <PayrollClient userId={userId} />;
}