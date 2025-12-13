import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/ui/toast";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "InstaSkul",
  description: "Modern and fully secure learning management system.",
  keywords: [
    "IT",
    "Consulting",
    "Agency",
    "digital courses",
    "online courses",
    "education",
    "Training",
    "Course management",
    "learning management system",
    "LMS",
    "e-learning",
    "free",
    "human resources",
    "corporate training",
    "skill development",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="min-h-full">
      <body className="flex flex-col min-h-full bg-gray-50">
        <ClerkProvider>
          <ToastProvider />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
