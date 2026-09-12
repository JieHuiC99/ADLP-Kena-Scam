import { NextResponse } from "next/server";
import { z } from "zod";
import { sanitiseTags } from "@/lib/data/taxonomy";
import { queueSubmission } from "@/lib/data/moderation";
import { supabaseUser } from "@/lib/supabase";
import { CATEGORIES, LANGS, LOSS_OPTIONS, OTHER, PLATFORMS, STATES } from "@/lib/data/types";
import type { Category, Lang, MyState, Platform } from "@/lib/data/types";

/**
 * Submissions — community stories, private reports and correction requests.
 *
 * Visibility is decided here from the KIND of submission, never from the
 * request body. A community story is published to the feed immediately; a
 * private report or a correction request is never public, so a crafted payload
 * claiming isPublic cannot make one visible. Tags are likewise re-validated
 * against the controlled vocabulary server-side rather than trusted.
 */

const Body = z.object({
  kind: z.enum(["community_story", "private_report", "correction_request"]),
  title: z.string().min(1).max(200),
  body: z.string().min(10).max(6000),
  category: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  language: z.string().default("en"),
  lossRange: z.string().nullable().optional(),
  tags: z.array(z.string()).max(20).default([]),
  aiSuggestedTags: z.array(z.string()).max(20).default([]),
  anonymous: z.boolean().default(true),
  consent: z.boolean(),
  hasAttachment: z.boolean().default(false),
  // Data URLs, capped so a payload cannot be used as free file hosting.
  images: z.array(z.string().startsWith("data:image/").max(2_000_000)).max(3).default([]),
  relatedStoryId: z.string().nullable().optional(),
});

const oneOf = <T extends string>(allowed: readonly T[], value: unknown): T | null =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid submission" }, { status: 400 });
  }

  const input = parsed.data;
  // Derived from the kind, never from the request body.
  const isStory = input.kind === "community_story";

  if (isStory) {
    // Written through the user-scoped client so row-level security sees the
    // session: a signed-in author is recorded, a signed-out one is not, and the
    // insert policy pins author_id to whoever is actually authenticated.
    const client = await supabaseUser();
    if (!client) {
      return NextResponse.json({ ok: false, error: "storage unavailable" }, { status: 503 });
    }
    const { data: session } = await client.auth.getUser();
    const author = session.user;
    const displayName =
      (author?.user_metadata?.display_name as string | undefined) ??
      author?.email?.split("@")[0] ??
      null;

    const { error: insertError } = await client.from("community_posts").insert({
      author_id: author?.id ?? null,
      author_name: input.anonymous ? null : displayName,
      anonymous: input.anonymous || !author,
      title: input.title.slice(0, 200),
      body: input.body.slice(0, 6000),
      category: oneOf<Category>(CATEGORIES, input.category),
      platform: input.platform === OTHER ? OTHER : oneOf<Platform>(PLATFORMS, input.platform),
      state: oneOf<MyState>(STATES, input.state),
      language: input.language === OTHER ? OTHER : (oneOf<Lang>(LANGS, input.language) ?? "en"),
      loss_range: oneOf(LOSS_OPTIONS, input.lossRange),
      tags: sanitiseTags(input.tags),
      images: input.images,
      status: "published",
    });

    if (insertError) {
      console.warn("[report] post failed:", insertError.message);
      return NextResponse.json({ ok: false, error: "could not post" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      status: "published",
      isPublic: true,
      message: "Posted. Your story is live in Community Stories.",
    });
  }

  const item = queueSubmission({
    id: `sub-${Date.now().toString(36)}`,
    kind: input.kind,
    title: input.title.slice(0, 200),
    body: input.body.slice(0, 6000),
    category: oneOf<Category>(CATEGORIES, input.category),
    // "Other" survives as a plain label; anything else must be a known platform.
    platform: input.platform === OTHER ? OTHER : oneOf<Platform>(PLATFORMS, input.platform),
    state: oneOf<MyState>(STATES, input.state),
    language: input.language === OTHER ? OTHER : (oneOf<Lang>(LANGS, input.language) ?? "en"),
    lossRange: oneOf(LOSS_OPTIONS, input.lossRange),
    tags: sanitiseTags(input.tags),
    aiSuggestedTags: sanitiseTags(input.aiSuggestedTags),
    anonymous: input.anonymous,
    consent: input.consent,
    hasAttachment: input.hasAttachment || input.images.length > 0,
    images: input.images,
    submittedAt: new Date().toISOString(),
    relatedStoryId: input.relatedStoryId ?? null,
    status: isStory ? "published" : "pending_review",
    isPublic: isStory,
    tagStatus: isStory ? "confirmed" : "pending_review",
  });

  return NextResponse.json({
    ok: true,
    status: isStory ? "published" : "pending_review",
    isPublic: isStory,
    queuedAt: item.receivedAt,
    message: isStory
      ? "Posted. Your story is live in Community Stories."
      : "Received. This report stays private and is never published.",
  });
}
