import { cache } from "react";
import { supabase } from "./supabase";
import type { Category, Lang, MyState, Platform } from "./data/types";
import { LANGS, PLATFORMS } from "./data/types";

/**
 * Community posts and their comment threads.
 *
 * These are the rows people wrote themselves, as opposed to the curated story
 * set. They are deliberately a separate type from `Story`: a curated story has
 * been redacted, translated, tagged and given a provenance record, and giving
 * both the same shape would invite the UI to treat them as equally checked.
 */

export type CommunityPost = {
  id: string;
  authorName: string | null;
  anonymous: boolean;
  title: string;
  body: string;
  category: Category | null;
  /** A known platform, "Other", or null. */
  platform: string | null;
  state: MyState | null;
  language: string;
  lossRange: string | null;
  tags: string[];
  images: string[];
  createdAt: string;
  commentCount: number;
};

export type PostComment = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type PostRow = {
  id: string;
  author_name: string | null;
  anonymous: boolean;
  title: string;
  body: string;
  category: string | null;
  platform: string | null;
  state: string | null;
  language: string | null;
  loss_range: string | null;
  tags: string[] | null;
  images: string[] | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

/** Known values pass through; anything else is dropped rather than rendered. */
const knownPlatform = (value: string | null): string | null =>
  value && (PLATFORMS.includes(value as Platform) || value === "Other") ? value : null;

const knownLanguage = (value: string | null): string =>
  value && (LANGS.includes(value as Lang) || value === "Other") ? value : "en";

export const getCommunityPosts = cache(async (): Promise<CommunityPost[]> => {
  const client = supabase();
  if (!client) return [];

  const [posts, comments] = await Promise.all([
    client
      .from("community_posts")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(100),
    // One query for every count rather than one per post.
    client.from("post_comments").select("post_id").limit(2000),
  ]);

  if (posts.error) {
    console.warn("[community] posts unavailable:", posts.error.message);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of (comments.data ?? []) as Array<{ post_id: string }>) {
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
  }

  return ((posts.data ?? []) as PostRow[]).map((row) => ({
    id: row.id,
    authorName: row.anonymous ? null : row.author_name,
    anonymous: row.anonymous,
    title: row.title,
    body: row.body,
    category: (row.category as Category) ?? null,
    platform: knownPlatform(row.platform),
    state: (row.state as MyState) ?? null,
    language: knownLanguage(row.language),
    lossRange: row.loss_range,
    tags: row.tags ?? [],
    images: row.images ?? [],
    createdAt: row.created_at,
    commentCount: counts.get(row.id) ?? 0,
  }));
});

export const getComments = cache(async (): Promise<Map<string, PostComment[]>> => {
  const client = supabase();
  if (!client) return new Map();

  const { data, error } = await client
    .from("post_comments")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(2000);

  if (error) {
    console.warn("[community] comments unavailable:", error.message);
    return new Map();
  }

  const byPost = new Map<string, PostComment[]>();
  for (const row of (data ?? []) as CommentRow[]) {
    const list = byPost.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      postId: row.post_id,
      authorName: row.author_name,
      body: row.body,
      createdAt: row.created_at,
    });
    byPost.set(row.post_id, list);
  }
  return byPost;
});
