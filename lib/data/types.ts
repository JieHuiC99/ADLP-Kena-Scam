/**
 * The Kena Scam data model.
 *
 * The vocabulary here deliberately matches the Supabase column values exactly —
 * "WhatsApp", not "whatsapp"; "Fake Job", not "fake-job" — so nothing has to be
 * translated between the database and the UI, and a value read off a row is the
 * value rendered on the page.
 *
 * Every record the public site can see is a curated demo record: fictional,
 * redacted, marked source_type "curated_demo" / is_demo true, and gated by
 * row-level security to status "approved_demo". Nothing was collected from a
 * social platform, and nothing a visitor submits is ever published
 * automatically — submissions are written with status "pending_review" and
 * is_public false, and RLS gives the public no read access to them at all.
 */

/* ----------------------------------------------------------------- basics */

export type Lang = "bm" | "en" | "zh" | "ta";

export const LANGS: Lang[] = ["bm", "en", "zh", "ta"];

export const LANG_LABEL: Record<Lang, string> = {
  bm: "BM",
  en: "English",
  zh: "中文",
  ta: "தமிழ்",
};

export const LANG_FULL: Record<Lang, string> = {
  bm: "Bahasa Melayu",
  en: "English",
  zh: "Chinese (中文)",
  ta: "Tamil (தமிழ்)",
};

/** The BCP-47 tag for the lang attribute, so screen readers switch voice. */
export const LANG_ATTR: Record<Lang, string> = {
  bm: "ms",
  en: "en",
  zh: "zh-Hans",
  ta: "ta",
};

export type Platform = "WhatsApp" | "Telegram" | "Facebook" | "TikTok" | "Instagram" | "Reddit";

export const PLATFORMS: Platform[] = [
  "WhatsApp",
  "Telegram",
  "Facebook",
  "TikTok",
  "Instagram",
  "Reddit",
];

export type Category =
  | "Fake Job"
  | "Parcel Scam"
  | "Investment Scam"
  | "AI Voice"
  | "Impersonation"
  | "E-commerce Scam"
  | "Romance Scam"
  | "Loan Scam"
  | "Account Takeover";

export const CATEGORIES: Category[] = [
  "Parcel Scam",
  "Fake Job",
  "Investment Scam",
  "AI Voice",
  "E-commerce Scam",
  "Impersonation",
  "Loan Scam",
  "Romance Scam",
  "Account Takeover",
];

/** The longer description used where there is room to explain the category. */
export const CATEGORY_LONG: Record<Category, string> = {
  "Parcel Scam": "Fake parcel / delivery fee",
  "Fake Job": "Fake job offer",
  "Investment Scam": "Investment / group-chat scam",
  "AI Voice": "AI voice impersonation",
  "E-commerce Scam": "E-commerce advance payment",
  Impersonation: "Bank / police impersonation",
  "Loan Scam": "Loan scam",
  "Romance Scam": "Romance scam",
  "Account Takeover": "Account takeover",
};

export const STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
] as const;

export type MyState = (typeof STATES)[number];

/** Buckets, never exact figures — every story is fictional. */
export type LossRange =
  | "RM0–RM100"
  | "RM101–RM500"
  | "RM501–RM1,000"
  | "RM1,001–RM5,000";

export const LOSS_RANGES: LossRange[] = [
  "RM0–RM100",
  "RM101–RM500",
  "RM501–RM1,000",
  "RM1,001–RM5,000",
];

/**
 * The value used when a submitter picks a platform or language outside the
 * lists we track. Kept as one constant so the form, the API and the feed all
 * agree on the spelling.
 */
export const OTHER = "Other";

/** The form offers an open top band the curated data does not contain. */
export const LOSS_OPTIONS: string[] = [...LOSS_RANGES, "RM5,000++"];

export type Severity = "low" | "medium" | "high";

/* ------------------------------------------------------------------- tags */

export type TagFacet = "scam_type" | "tactic" | "platform" | "geography" | "language";

export type Tag = {
  id: string;
  label: string;
  facet: TagFacet;
  tone: string;
  /** Matched case-insensitively by the natural-language query mapper. */
  synonyms: string[];
};

/* ------------------------------------------------------------- provenance */

export type ConsentStatus =
  | "creator_submitted"
  | "creator_consented"
  | "official_source"
  | "public_lead_not_republished"
  | "demo";

export type CreditPreference = "anonymous" | "platform_only" | "handle_and_link";

export type SourceReviewStatus = "pending_review" | "approved" | "withdrawn" | "removed";

/**
 * One provenance record per story.
 *
 * Public attribution is NEVER read off this record directly by a component —
 * everything goes through publicAttributionFor() in lib/provenance.ts, which is
 * the single place the consent and credit rules are enforced. Row-level
 * security is the outer layer of the same rule: only review_status "approved"
 * rows are readable at all, so a withdrawal removes the record from the public
 * API before any application code is involved.
 */
export type StorySource = {
  id: string;
  storyId: string;
  platform: Platform;
  /** Placeholder example.com URLs only. Never a real post. */
  sourceUrl: string | null;
  sourceType: string;
  creatorDisplayName: string | null;
  creatorHandle: string | null;
  creditPreference: CreditPreference;
  consentStatus: ConsentStatus;
  consentRecordedAt: string | null;
  reviewStatus: SourceReviewStatus;
  originalPublishedAt: string | null;
  removalRequestedAt: string | null;
  notes: string | null;
};

/* ----------------------------------------------------------------- stories */

export type Story = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** The story as told, in its original language. Fictional and redacted. */
  originalText: string;
  originalLanguage: Lang;
  /** Seeded translations, keyed by language. */
  translations: Record<Lang, string>;
  titleTranslations: Record<Lang, string>;
  platform: Platform;
  category: Category;
  state: MyState;
  lossRange: LossRange;
  /** 0–100. How strongly the pattern matches known scam behaviour. */
  susScore: number;
  /** ISO date. */
  date: string;
  trendId: string | null;
  /** Confirmed tags, all drawn from the controlled taxonomy. */
  tags: string[];
  aiSuggestedTags: string[];
  tagStatus: "confirmed" | "pending_review";
  redFlags: string[];
  safeAction: string;
  reactions: number;
  shares: number;
  saves: number;
  sourceType: string;
  isDemo: boolean;
  status: string;
};

/* ------------------------------------------------------------------ trends */

export type Trend = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  whySpreading: string;
  redFlags: string[];
  safeAction: string;
  /** Week-over-week movement inside the curated demo set, as a percentage. */
  momentum: number;
  firstSeen: string | null;
  platforms: Platform[];
  languages: Lang[];
  tags: string[];
  weeklyStatus: string;
  isDemo: boolean;
};

/* ------------------------------------------------------------------- radar */

export type RadarReport = {
  id: string;
  storyId: string | null;
  state: MyState;
  category: Category;
  platform: Platform;
  language: Lang;
  /** ISO date. */
  reportedAt: string;
  severity: Severity;
  isDemo: boolean;
  status: string;
};

/* ------------------------------------------------------------------ weekly */

export type WeeklyDigest = {
  id: string;
  weekStart: string;
  headline: string;
  topStoryIds: string[];
  emergingMethod: string;
  susLinkBehaviour: string;
  aiScamWatch: string;
  familyGroupTip: string;
  isDemo: boolean;
};

/* -------------------------------------------------------------- simulation */

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy lah",
  medium: "Quite sus",
  hard: "Final boss",
};

export type SimulationChoice = {
  label: string;
  /** A "safe" choice is the anti-kena move. */
  outcome: "safe" | "kena";
  feedback: string;
};

/** A phrase in the transcript, and the pressure tactic it is performing. */
export type TranscriptCue = "urgency" | "fear" | "authority" | "fomo" | "isolation";

export type TranscriptFlag = {
  phrase: string;
  cue: TranscriptCue;
  explain: string;
};

export type SimulationScenario = {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** A "voice" scenario renders the chat-app voice-note player. */
  medium: "message" | "voice";
  channelLabel: string;
  /** The fictional bait, as the player would see it. */
  body: string;
  choices: SimulationChoice[];
  redFlags: string[];
  realWorldAction: string;
  coachLine: string;
  transcriptFlags: TranscriptFlag[];
  isFinalBoss: boolean;
  isDemo: boolean;
};

export type SimulationResult = {
  scenarioId: string;
  choiceIndex: number;
  outcome: "safe" | "kena";
};

/* ----------------------------------------------- submissions & moderation */

export type SubmissionKind = "community_story" | "private_report" | "correction_request";

export type CommunitySubmission = {
  id: string;
  kind: SubmissionKind;
  title: string;
  body: string;
  category: Category | null;
  /** A platform name, or "Other" when it is not one of the six we track. */
  platform: string | null;
  state: MyState | null;
  /** A language code, or "other" when it is outside the four we translate. */
  language: string;
  lossRange: string | null;
  tags: string[];
  aiSuggestedTags: string[];
  anonymous: boolean;
  consent: boolean;
  hasAttachment: boolean;
  /**
   * Screenshots or memes attached to the post, shown in the feed.
   * Stored as data URLs in the prototype so no upload bucket is needed.
   */
  images: string[];
  submittedAt: string;
  /**
   * Community stories are published to the feed on submission. Private reports
   * and correction requests are never public, whatever else changes.
   */
  status: "published" | "pending_review";
  isPublic: boolean;
  tagStatus: "confirmed" | "pending_review";
  relatedStoryId?: string | null;
};

export type ModerationStep =
  | "source_received"
  | "redact"
  | "confirm_permission"
  | "review_evidence"
  | "apply_tags"
  | "approve";

export type ModerationItem = {
  id: string;
  submissionId: string;
  step: ModerationStep;
  receivedAt: string;
  note: string;
};

/* -------------------------------------------------------------------- chat */

export type ChatCitation = {
  kind: "story" | "trend";
  id: string;
  title: string;
  href: string;
};

export type ChatReply = {
  answer: string;
  citations: ChatCitation[];
  /** "openai" when a key is configured, "local" for the grounded fallback. */
  engine: "openai" | "local";
};
