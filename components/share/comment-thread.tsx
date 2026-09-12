"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { buttonClass, cn } from "@/components/ui";
import { browserSupabase } from "@/lib/supabase-browser";
import type { PostComment } from "@/lib/community";
import { timeAgo } from "@/lib/format";

/**
 * Comments under a community post.
 *
 * Reading is open to everyone; writing needs an account, which is the one thing
 * signing in unlocks. Row-level security enforces that too — the insert policy
 * requires the row's author to be the signed-in user — so the signed-out state
 * here is a courtesy, not the actual gate.
 *
 * New comments are appended locally on success rather than forcing a reload, so
 * the thread does not jump under the person who just wrote in it.
 */
export function CommentThread({
  postId,
  initial,
  user,
}: {
  postId: string;
  initial: PostComment[];
  user: { id: string; name: string } | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initial);
  const [open, setOpen] = useState(initial.length > 0 && initial.length <= 2);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !user) return;

    setBusy(true);
    setError(null);
    try {
      const { data, error: insertError } = await browserSupabase()
        .from("post_comments")
        .insert({ post_id: postId, author_id: user.id, author_name: user.name, body: text })
        .select()
        .single();
      if (insertError) throw insertError;

      setComments((current) => [
        ...current,
        {
          id: data.id as string,
          postId,
          authorName: user.name,
          body: text,
          createdAt: data.created_at as string,
        },
      ]);
      setBody("");
      // Keep the server-rendered count in step for the next navigation.
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not post that comment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border-t border-line-soft">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-5 py-3 text-left text-micro font-bold text-ink-muted transition hover:bg-paper-tint hover:text-purple-700"
      >
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
        {comments.length === 0
          ? "No comments yet — add one"
          : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        <span className="ml-auto" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open ? (
        <div className="border-t border-line-soft bg-paper-tint px-5 py-4">
          {comments.length ? (
            <ul className="grid gap-3">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-2.5">
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-purple-200 text-[11px] font-extrabold text-purple-900"
                    aria-hidden="true"
                  >
                    {comment.authorName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-micro font-bold text-ink">
                      {comment.authorName}
                      <span className="ml-2 font-normal text-ink-muted">
                        {timeAgo(comment.createdAt, new Date())}
                      </span>
                    </p>
                    <p className="mt-0.5 text-body text-ink wrap-anywhere">{comment.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {user ? (
            <form onSubmit={submit} className={cn("flex gap-2", comments.length > 0 && "mt-4")}>
              <label htmlFor={`comment-${postId}`} className="sr-only">
                Add a comment
              </label>
              <input
                id={`comment-${postId}`}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Add what you know about this one…"
                maxLength={1000}
                className="min-w-0 flex-1 rounded-pill border border-line bg-white px-3.5 py-2 text-body focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-600/12"
              />
              <button
                type="submit"
                disabled={busy || !body.trim()}
                aria-label="Post comment"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-ink text-white transition hover:bg-ink-soft disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" strokeWidth={2.4} />
                )}
              </button>
            </form>
          ) : (
            <p className={cn("text-micro text-ink-muted", comments.length > 0 && "mt-4")}>
              <Link
                href="/signin?next=/share%3Ftab%3Dcommunity"
                className="font-bold text-purple-700 hover:underline"
              >
                Sign in
              </Link>{" "}
              to add a comment. Reading and posting a story do not need an account.
            </p>
          )}

          {error ? (
            <p role="alert" className="mt-2 text-micro font-semibold text-risk">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
