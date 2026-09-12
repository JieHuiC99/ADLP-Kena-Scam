"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { buttonClass, cn } from "@/components/ui";
import { browserSupabase } from "@/lib/supabase-browser";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        await browserSupabase().auth.signOut();
        // refresh() re-runs the server components so the nav updates too.
        router.refresh();
      }}
      aria-label="Sign out"
      // Icon-only until there is room for the word: with a username and three
      // other buttons already in the header, the label is what tips it into
      // wrapping.
      className={cn(buttonClass("ghost", "sm"), "px-2.5 lg:px-3.5", className)}
    >
      <LogOut className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      <span className="hidden lg:inline">Sign out</span>
    </button>
  );
}
