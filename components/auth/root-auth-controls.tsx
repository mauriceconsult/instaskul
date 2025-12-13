"use client";

import {
  SignedIn,
  SignedOut,
  SignOutButton,
  SignInButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";

export function RootAuthControls() {
  return (
    <div className="flex gap-2">
      <SignedIn>
        <SignOutButton>
          <Button variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </SignOutButton>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <Button size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
