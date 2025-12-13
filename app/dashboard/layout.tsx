import { headers } from "next/headers";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // ✅ Await headers here to satisfy Next.js dynamic API requirements
  await headers();

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </div>
      <div className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>
      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default DashboardLayout;
