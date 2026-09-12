import type { CommunitySubmission, ModerationItem, ModerationStep } from "./types";

/**
 * Community submissions and the moderation queue.
 *
 * Two paths, deliberately different:
 *
 * - A COMMUNITY STORY is published to the Community Stories tab the moment it
 *   is submitted. It is labelled there as an unreviewed community post so a
 *   reader can tell it apart from the curated, redacted demo set.
 * - A PRIVATE REPORT (from the I kena already page) or a CORRECTION REQUEST is
 *   never public, whatever else changes. Those are private by definition — the
 *   person filing one has not asked to publish anything.
 *
 * For the prototype both live in memory on globalThis. In production the public
 * stories would be a Supabase table with public read, and reports would keep
 * the row-level security that denies public read entirely.
 */

export const MODERATION_PIPELINE: Array<{
  step: ModerationStep;
  label: string;
  detail: string;
}> = [
  {
    step: "source_received",
    label: "Source link received",
    detail: "A community story goes live immediately and appears in the feed. Private reports and correction requests stay here, visible to moderators only.",
  },
  {
    step: "redact",
    label: "Redact private information",
    detail:
      "Names, handles, phone numbers, account numbers, addresses, IC numbers and screenshots of private chats are removed before anything else happens.",
  },
  {
    step: "confirm_permission",
    label: "Confirm permission, or classify as a public lead",
    detail:
      "Either the creator submitted it or consented to it being shared, or it is classified as a non-republished public lead and rewritten as an anonymous pattern insight.",
  },
  {
    step: "review_evidence",
    label: "Review story and evidence",
    detail:
      "The account is checked for accusations against identifiable people or businesses. Kena Scam publishes patterns, not allegations.",
  },
  {
    step: "apply_tags",
    label: "Apply controlled taxonomy tags",
    detail: "Tags are drawn only from the controlled vocabulary. Any free-form or AI-suggested tag is confirmed by a moderator here.",
  },
  {
    step: "approve",
    label: "Confirm or take down",
    detail: "A moderator confirms the story can stay up, or takes it down. Curated demo stories still require approval before they are ever published.",
  },
];


/**
 * Fictional screenshots attached to the seeded posts. Drawn as SVG data URLs —
 * no real message, website, brand, number or account appears in either.
 */
const DEMO_CHAT_SHOT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRUNFNUREIi8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjQiIGZpbGw9IiMwRjE3MjkiLz4KPHRleHQgeD0iMjQiIHk9IjQwIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIGZvbnQtd2VpZ2h0PSI3MDAiPis2MCAxWC1YWFggWFhYWDwvdGV4dD4KPHRleHQgeD0iMjQiIHk9IjU4IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZpbGw9IiM5QUExQUUiPnVua25vd24gbnVtYmVyPC90ZXh0Pgo8ZyBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwRjE3MjkiPgo8cmVjdCB4PSIyNCIgeT0iOTYiIHdpZHRoPSI0MjAiIGhlaWdodD0iMTA0IiByeD0iMTYiIGZpbGw9IiNmZmYiLz4KPHRleHQgeD0iNDQiIHk9IjEzMiI+WW91ciBwYXJjZWwgaXMgb24gaG9sZCBhdCB0aGU8L3RleHQ+Cjx0ZXh0IHg9IjQ0IiB5PSIxNTgiPnNvcnRpbmcgY2VudHJlLiBPdXRzdGFuZGluZzwvdGV4dD4KPHRleHQgeD0iNDQiIHk9IjE4NCI+aGFuZGxpbmcgZmVlOiBSTTIuNTA8L3RleHQ+CjxyZWN0IHg9IjI0IiB5PSIyMTYiIHdpZHRoPSI0NTIiIGhlaWdodD0iODAiIHJ4PSIxNiIgZmlsbD0iI2ZmZiIvPgo8dGV4dCB4PSI0NCIgeT0iMjUyIj5TZXR0bGUgbm93IG9yIGl0ZW0gcmV0dXJucyB0bzwvdGV4dD4KPHRleHQgeD0iNDQiIHk9IjI3OCI+c2VuZGVyIHRvZGF5LjwvdGV4dD4KPHJlY3QgeD0iMjQiIHk9IjMxMiIgd2lkdGg9IjM5MiIgaGVpZ2h0PSI2NCIgcng9IjE2IiBmaWxsPSIjZmZmIi8+Cjx0ZXh0IHg9IjQ0IiB5PSIzNTIiIGZpbGw9IiMyNTYzRUIiPmh4eHBzOi8vdHJhY2stbXktcGFyY2VsWy5deHl6L3BheTwvdGV4dD4KPHJlY3QgeD0iMjQwIiB5PSI0MDAiIHdpZHRoPSIzMzYiIGhlaWdodD0iNjQiIHJ4PSIxNiIgZmlsbD0iI0Q5RkREMyIvPgo8dGV4dCB4PSIyNjIiIHk9IjQ0MCI+d2hvIGlzIHRoaXM/IHdoaWNoIGNvdXJpZXI/PC90ZXh0Pgo8cmVjdCB4PSIyNCIgeT0iNDgwIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjU2IiByeD0iMTYiIGZpbGw9IiNmZmYiLz4KPHRleHQgeD0iNDQiIHk9IjUxNiI+UGF5IGZpcnN0IHRoZW4gd2UgY29uZmlybTwvdGV4dD4KPC9nPgo8dGV4dCB4PSIyNCIgeT0iNTc2IiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTMiIGZpbGw9IiM2QjcyODAiPkZpY3Rpb25hbCBleGFtcGxlIOKAlCBub3QgYSByZWFsIG1lc3NhZ2U8L3RleHQ+Cjwvc3ZnPg==";
const DEMO_PAGE_SHOT = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgNjAwIDYwMCI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjZGNUZGIi8+CjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2MDAiIGhlaWdodD0iNzIiIGZpbGw9IiNmZmYiLz4KPHJlY3QgeD0iMjQiIHk9IjI0IiB3aWR0aD0iNTUyIiBoZWlnaHQ9IjMyIiByeD0iMTYiIGZpbGw9IiNFRUYwRjYiLz4KPGNpcmNsZSBjeD0iNDgiIGN5PSI0MCIgcj0iNyIgZmlsbD0iI0RDM0I0QiIvPgo8dGV4dCB4PSI2OCIgeT0iNDYiIGZvbnQtZmFtaWx5PSJ1aS1tb25vc3BhY2UsbW9ub3NwYWNlIiBmb250LXNpemU9IjE1IiBmaWxsPSIjMEYxNzI5Ij5kZTFpdmVyeS1teS1wYXJjZTFbLl10b3AvdmVyaWZ5PC90ZXh0Pgo8ZyBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZpbGw9IiMwRjE3MjkiPgo8cmVjdCB4PSI2MCIgeT0iMTEyIiB3aWR0aD0iNDgwIiBoZWlnaHQ9IjQxNiIgcng9IjIwIiBmaWxsPSIjZmZmIiBzdHJva2U9IiNFOEU5RjAiLz4KPHRleHQgeD0iOTIiIHk9IjE2OCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjcwMCI+Q29uZmlybSBkZWxpdmVyeSBwYXltZW50PC90ZXh0Pgo8dGV4dCB4PSI5MiIgeT0iMjAwIiBmb250LXNpemU9IjE1IiBmaWxsPSIjNkI3MjgwIj5BbW91bnQgZHVlOiBSTTIuNTA8L3RleHQ+Cjx0ZXh0IHg9IjkyIiB5PSIyNTIiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI3MDAiPkNBUkQgTlVNQkVSPC90ZXh0Pgo8cmVjdCB4PSI5MiIgeT0iMjY0IiB3aWR0aD0iNDE2IiBoZWlnaHQ9IjQ0IiByeD0iMTAiIGZpbGw9IiNGNkY1RkYiIHN0cm9rZT0iI0U0REVGRiIvPgo8dGV4dCB4PSI5MiIgeT0iMzM2IiBmb250LXNpemU9IjEzIiBmb250LXdlaWdodD0iNzAwIj5DVlYgKEJBQ0sgT0YgQ0FSRCk8L3RleHQ+CjxyZWN0IHg9IjkyIiB5PSIzNDgiIHdpZHRoPSIxOTYiIGhlaWdodD0iNDQiIHJ4PSIxMCIgZmlsbD0iI0ZFRjBGMyIgc3Ryb2tlPSIjRjVBM0FFIi8+Cjx0ZXh0IHg9IjkyIiB5PSI0MjAiIGZvbnQtc2l6ZT0iMTMiIGZvbnQtd2VpZ2h0PSI3MDAiPk9ORS1USU1FIFBBU1NXT1JEPC90ZXh0Pgo8cmVjdCB4PSI5MiIgeT0iNDMyIiB3aWR0aD0iMTk2IiBoZWlnaHQ9IjQ0IiByeD0iMTAiIGZpbGw9IiNGRUYwRjMiIHN0cm9rZT0iI0Y1QTNBRSIvPgo8cmVjdCB4PSIzMjAiIHk9IjQyNCIgd2lkdGg9IjE4OCIgaGVpZ2h0PSI1NiIgcng9IjI4IiBmaWxsPSIjNkQ0QUZGIi8+Cjx0ZXh0IHg9IjM1NiIgeT0iNDU5IiBmb250LXNpemU9IjE3IiBmaWxsPSIjZmZmIiBmb250LXdlaWdodD0iNzAwIj5QYXkgUk0yLjUwPC90ZXh0Pgo8L2c+Cjx0ZXh0IHg9IjYwIiB5PSI1NjYiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMyIgZmlsbD0iIzZCNzI4MCI+RmljdGlvbmFsIGV4YW1wbGUg4oCUIG5vdCBhIHJlYWwgd2Vic2l0ZTwvdGV4dD4KPC9zdmc+";

/** Seeded items so the queue view is populated for review. */
const SEEDED_SUBMISSIONS: CommunitySubmission[] = [
  {
    id: "sub-demo-101",
    kind: "community_story",
    title: "The RM2.50 parcel fee that wanted my CVV",
    body:
      "Got the usual parcel message at night. I nearly paid because RM2.50 is nothing, but the page asked for the three digits on the back of my card AND an OTP. Screenshotted both before closing it. Look at the URL — extra characters, and it is a .top domain.",
    category: "Parcel Scam",
    platform: "WhatsApp",
    state: "Selangor",
    language: "en",
    lossRange: "RM0–RM100",
    tags: ["ParcelScam", "SuspiciousLink", "OTPRequest", "WhatsApp", "Selangor", "English"],
    aiSuggestedTags: ["ParcelScam", "SuspiciousLink", "OTPRequest"],
    tagStatus: "confirmed",
    anonymous: true,
    consent: true,
    hasAttachment: true,
    images: [DEMO_CHAT_SHOT, DEMO_PAGE_SHOT],
    submittedAt: "2026-09-12T09:12:00Z",
    status: "published",
    isPublic: true,
  },
  {
    id: "sub-demo-102",
    kind: "community_story",
    title: "Recruiter promised RM450 a day, then asked me to top up",
    body:
      "Telegram recruiter, very polite, paid me RM12 and RM38 for the first two tasks. Third task needed me to put in RM600 of my own money first to unlock a bigger commission. That is when I left. Posting so somebody searches it before they deposit.",
    category: "Fake Job",
    platform: "Telegram",
    state: "Johor",
    language: "en",
    lossRange: "RM0–RM100",
    tags: ["FakeJob", "AdvancePayment", "TooGoodToBeTrue", "Telegram", "Johor", "English"],
    aiSuggestedTags: ["FakeJob", "AdvancePayment"],
    tagStatus: "confirmed",
    anonymous: true,
    consent: true,
    hasAttachment: false,
    images: [],
    submittedAt: "2026-09-11T16:40:00Z",
    status: "published",
    isPublic: true,
  },
  {
    id: "sub-demo-001",
    kind: "community_story",
    title: "Fake delivery notice with a lookalike tracking page",
    body:
      "Received a delivery notice with a link. The page looked almost right but the address had extra characters. Did not enter anything. [Details redacted pending review.]",
    category: "Parcel Scam",
    platform: "WhatsApp",
    state: "Selangor",
    language: "en",
    lossRange: "RM0–RM100",
    tags: ["ParcelScam", "SuspiciousLink", "WhatsApp", "Selangor", "English"],
    aiSuggestedTags: ["ParcelScam", "SuspiciousLink"],
    tagStatus: "pending_review",
    anonymous: true,
    consent: true,
    hasAttachment: true,
    images: [],
    submittedAt: "2026-09-11T03:20:00Z",
    status: "pending_review",
    isPublic: false,
  },
  {
    id: "sub-demo-002",
    kind: "community_story",
    title: "Group chat investment with a withdrawal fee",
    body:
      "Was added to a group where everyone posted profits. Withdrawal required a percentage payment first. [Details redacted pending review.]",
    category: "Investment Scam",
    platform: "Telegram",
    state: "Kuala Lumpur",
    language: "zh",
    lossRange: "RM1,001–RM5,000",
    tags: ["InvestmentScam", "AdvancePayment", "Telegram", "KualaLumpur", "Chinese"],
    aiSuggestedTags: ["InvestmentScam", "AdvancePayment", "FOMO"],
    tagStatus: "pending_review",
    anonymous: true,
    consent: true,
    hasAttachment: false,
    images: [],
    submittedAt: "2026-09-10T14:05:00Z",
    status: "pending_review",
    isPublic: false,
  },
  {
    id: "sub-demo-003",
    kind: "private_report",
    title: "Private report — OTP shared with caller",
    body: "[Private report. Contents visible to moderators only.]",
    category: "Impersonation",
    platform: "WhatsApp",
    state: "Johor",
    language: "bm",
    lossRange: "RM501–RM1,000",
    tags: ["Impersonation", "OTPRequest", "WhatsApp", "Johor", "BM"],
    aiSuggestedTags: [],
    tagStatus: "pending_review",
    anonymous: true,
    consent: false,
    hasAttachment: false,
    images: [],
    submittedAt: "2026-09-12T01:40:00Z",
    status: "pending_review",
    isPublic: false,
  },
];

const SEEDED_ITEMS: ModerationItem[] = [
  {
    id: "mod-demo-001",
    submissionId: "sub-demo-001",
    step: "redact",
    receivedAt: "2026-09-11T03:20:00Z",
    note: "Screenshot attached — awaiting redaction check before anything else.",
  },
  {
    id: "mod-demo-002",
    submissionId: "sub-demo-002",
    step: "apply_tags",
    receivedAt: "2026-09-10T14:05:00Z",
    note: "Redacted. AI-suggested tags need moderator confirmation.",
  },
  {
    id: "mod-demo-003",
    submissionId: "sub-demo-003",
    step: "source_received",
    receivedAt: "2026-09-12T01:40:00Z",
    note: "Private report. Consent to publish was not given — never becomes public.",
  },
];

/* Runtime queue. Seeded copies first, then anything submitted this session.
 *
 * Held on globalThis rather than in a module-level binding because Next loads
 * route handlers and server components into separate module graphs — with a
 * plain module array, a submission made through /api/report would be invisible
 * to the /moderation page rendering it. */
type QueueStore = { submissions: CommunitySubmission[]; items: ModerationItem[] };

const globalStore = globalThis as typeof globalThis & { __kenaQueue?: QueueStore };

const store: QueueStore = (globalStore.__kenaQueue ??= {
  submissions: [...SEEDED_SUBMISSIONS],
  items: [...SEEDED_ITEMS],
});

const { submissions, items } = store;

export function queueSubmission(submission: CommunitySubmission): ModerationItem {
  submissions.unshift(submission);
  const item: ModerationItem = {
    id: `mod-${submission.id}`,
    submissionId: submission.id,
    // A published story has already skipped the gate, so it enters the queue at
    // the review step rather than waiting at the door.
    step: submission.isPublic ? "review_evidence" : "source_received",
    receivedAt: submission.submittedAt,
    note:
      submission.kind === "correction_request"
        ? "Correction or removal request. Routed to a moderator; no automated action taken."
        : submission.isPublic
          ? "Published to Community Stories on submission. Listed here for after-the-fact review."
          : "Private report. Never published, whatever the reviewer decides.",
  };
  items.unshift(item);
  return item;
}

/**
 * The community stories visitors have posted, newest first.
 *
 * Only the public kind is ever returned. A private report cannot leak into the
 * feed through this function, because the filter lives here rather than at each
 * call site — one place to get right instead of several.
 */
export function listPublishedSubmissions(): CommunitySubmission[] {
  return submissions.filter(
    (submission) => submission.kind === "community_story" && submission.isPublic
  );
}

export function listQueue(): Array<{ submission: CommunitySubmission; item: ModerationItem }> {
  return items
    .map((item) => {
      const submission = submissions.find((s) => s.id === item.submissionId);
      return submission ? { submission, item } : null;
    })
    .filter((row): row is { submission: CommunitySubmission; item: ModerationItem } => row !== null);
}

export function queueCounts() {
  return {
    total: items.length,
    stories: submissions.filter((s) => s.kind === "community_story").length,
    reports: submissions.filter((s) => s.kind === "private_report").length,
    corrections: submissions.filter((s) => s.kind === "correction_request").length,
  };
}
