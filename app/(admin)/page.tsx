import { redirect } from "next/navigation";

export default function AdminRootPage() {
  // Redirect to your main admin dashboard
  redirect("/admin/admins");   // or "/admin/payroll", "/admin/school", etc.

  // Or render a simple landing
  // return <div>Welcome to Instaskul Admin</div>;
}