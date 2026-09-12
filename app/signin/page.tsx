import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { currentUser } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Kena Scam to join the conversation on community stories.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ next }, user] = await Promise.all([searchParams, currentUser()]);
  // Already signed in: nothing to do here.
  if (user) redirect(next ?? "/share?tab=community");

  return (
    <div className="shell flex justify-center py-12">
      <div className="w-full max-w-lg">
        <Suspense>
          <AuthForm next={next ?? "/share?tab=community"} />
        </Suspense>
      </div>
    </div>
  );
}
