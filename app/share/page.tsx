import type { Metadata } from "next";
import { ShareClient } from "@/components/share/share-client";
import { getStoryViews } from "@/lib/repo";
import { getCommunityPosts, getComments } from "@/lib/community";
import { currentUser } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Join the gang",
  description:
    "Share your scam story so someone else recognises the pattern before it is too late. Anonymous by default, redacted and reviewed before anything is published.",
};

// Posted stories live in memory, so this route must not be cached.
export const dynamic = "force-dynamic";

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab }, stories, posts, commentMap, user] = await Promise.all([
    searchParams,
    getStoryViews(),
    getCommunityPosts(),
    getComments(),
    currentUser(),
  ]);
  // Approved demo stories only. Nothing from the submission queue reaches here.
  const approved = stories.filter((story) => story.status === "approved_demo");

  return (
    <ShareClient
      stories={approved}
      posts={posts}
      comments={Object.fromEntries(commentMap)}
      user={user ? { id: user.id, name: user.name } : null}
      initialTab={tab === "community" ? "community" : "share"}
    />
  );
}
