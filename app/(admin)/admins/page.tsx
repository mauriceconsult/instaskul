import { redirect } from "next/navigation";

export default function AdminsRedirectPage() {
  redirect("/dashboard/admins");
}
