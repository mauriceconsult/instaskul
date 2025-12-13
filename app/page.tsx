import { RootAuthControls } from "@/components/auth/root-auth-controls";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Welcome to InstaSkul</h1>
      <RootAuthControls />
    </main>
  );
}
