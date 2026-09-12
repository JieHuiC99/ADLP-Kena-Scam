"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Card, Field, buttonClass, cn, inputClass } from "@/components/ui";
import { Mascot } from "@/components/ui/mascot";
import { authConfigured, browserSupabase } from "@/lib/supabase-browser";

/**
 * Sign in and sign up.
 *
 * An account is only needed to comment — reading and posting a story both work
 * signed out — so this page leads with what signing in actually gets you rather
 * than treating the account as the point.
 *
 * The display name is stored in user metadata rather than a profiles table:
 * it is the only thing we need about a person, and a second table would be a
 * second place for personal data to sit.
 */
export function AuthForm({ next = "/share?tab=community" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!authConfigured) {
      setError("Accounts are not configured in this environment.");
      return;
    }
    if (password.length < 8) {
      setError("Password needs to be at least 8 characters.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Pick a display name — this is what shows next to your comments.");
      return;
    }

    setBusy(true);
    try {
      const client = browserSupabase();

      if (mode === "signup") {
        const { error: signUpError } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() } },
        });
        if (signUpError) throw signUpError;
        // Depending on the project's confirmation setting, the session may or
        // may not exist yet — check rather than assume.
        const { data } = await client.auth.getSession();
        if (!data.session) {
          setNotice("Account created. Check your email to confirm it, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }

      router.push(next);
      router.refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went wrong.";
      setError(
        /invalid login/i.test(message)
          ? "That email and password do not match an account."
          : message
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 bg-panel-tint px-6 py-5">
        <Mascot pose="friendly-intro" size="sm" className="shrink-0" />
        <div className="min-w-0">
          <h1 className="font-display text-h2">
            {mode === "signin" ? "Welcome back lah" : "Join the gang"}
          </h1>
          <p className="mt-1 text-body text-ink-muted">
            You only need an account to leave comments. Reading and posting a story both work
            without one.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 p-6">
        {mode === "signup" ? (
          <Field
            label="Display name"
            htmlFor="auth-name"
            required
            hint="Shown next to your comments. A first name or a handle is fine."
          >
            <input
              id="auth-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
              autoComplete="nickname"
              maxLength={40}
            />
          </Field>
        ) : null}

        <Field label="Email" htmlFor="auth-email" required>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
            autoComplete="email"
            required
          />
        </Field>

        <Field
          label="Password"
          htmlFor="auth-password"
          required
          hint={mode === "signup" ? "At least 8 characters." : undefined}
        >
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />
        </Field>

        {error ? (
          <p role="alert" className="text-body font-semibold text-risk">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="flex items-start gap-2 rounded-chip bg-safe-soft px-3.5 py-2.5 text-body font-semibold text-safe-deep">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            {notice}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className={cn(buttonClass("dark", "lg"))}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>

        <p className="text-center text-body text-ink-muted">
          {mode === "signin" ? "No account yet?" : "Already have one?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setNotice(null);
            }}
            className="font-bold text-purple-700 hover:underline"
          >
            {mode === "signin" ? "Create one" : "Sign in instead"}
          </button>
        </p>
      </form>
    </Card>
  );
}
