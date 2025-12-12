import { redirect } from "next/navigation";

export default function AdminRoot() {
  redirect("/admin/admins"); // or "/admin/payroll" or your main page
}