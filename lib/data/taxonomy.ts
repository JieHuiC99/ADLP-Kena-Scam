import type { Category, Lang, MyState, Platform, Tag, TagFacet } from "./types";

/**
 * The controlled tag vocabulary.
 *
 * This mirrors the `taxonomy_tags` table exactly — same ids, same facets, same
 * synonyms — and exists as a static module so that client components (chips,
 * the search box, the tag input) can resolve a tag synchronously without a
 * round trip. The database remains the source of truth; this is its shape.
 *
 * Crucially it contains ONLY scam types, tactics, platforms, Malaysian states
 * and languages. There is no facet for a person, a business, a bank, a phone
 * number or an account, so a tag naming one cannot be represented here at all.
 * That is the structural reason the AI tagger cannot produce a defamatory tag,
 * rather than a rule we hope a prompt will follow.
 */

const tag = (id: string, label: string, facet: TagFacet, tone: string, synonyms: string[]): Tag => ({
  id,
  label,
  facet,
  tone,
  synonyms,
});

/* --------------------------------------------------------------- scam type */

export const TYPE_TAGS: Tag[] = [
  tag("FakeJob", "Fake Job", "scam_type", "hot", [
    "fake job", "job scam", "part time job", "part-time", "kerja palsu", "tawaran kerja",
    "easy money job", "假工作", "招聘诈骗", "வேலை மோசடி", "job offer", "recruitment", "task job",
  ]),
  tag("ParcelScam", "Parcel Scam", "scam_type", "hot", [
    "parcel", "parcel scam", "delivery", "courier", "postage", "customs", "bungkusan",
    "penghantaran", "包裹", "快递", "பார்சல்", "rm0 parcel", "delivery fee", "shipping fee",
  ]),
  tag("InvestmentScam", "Investment Scam", "scam_type", "hot", [
    "investment", "investment scam", "invest", "trading", "crypto", "forex", "saham",
    "pelaburan", "投资", "理财", "முதலீடு", "signal group", "guaranteed return",
  ]),
  tag("AIVoice", "AI Voice", "scam_type", "hot", [
    "ai voice", "voice clone", "voice note", "deepfake", "cloned voice", "suara palsu",
    "suara ai", "语音诈骗", "克隆声音", "குரல்", "changed number", "voice message scam",
  ]),
  tag("Impersonation", "Impersonation", "scam_type", "hot", [
    "impersonation", "bank scam", "police", "officer", "menyamar", "pegawai", "冒充", "警察",
    "ஆள்மாறாட்டம்", "pretending to be", "fake officer", "fake bank",
  ]),
  tag("E-commerceScam", "E-commerce Scam", "scam_type", "hot", [
    "ecommerce", "e-commerce", "e-commerce scam", "online shopping", "seller", "marketplace",
    "preorder", "pre-order", "jual beli", "penjual", "网购", "卖家", "ஆன்லைன் ஷாப்பிங்",
    "deposit seller",
  ]),
  tag("RomanceScam", "Romance Scam", "scam_type", "hot", [
    "romance", "romance scam", "love scam", "dating", "boyfriend", "girlfriend", "cinta",
    "kekasih", "杀猪盘", "恋爱诈骗", "காதல் மோசடி", "online lover",
  ]),
  tag("LoanScam", "Loan Scam", "scam_type", "hot", [
    "loan", "loan scam", "pinjaman", "borrow money", "credit", "贷款", "借钱", "கடன்",
    "processing fee", "instant loan", "easy loan",
  ]),
  tag("AccountTakeover", "Account Takeover", "scam_type", "hot", [
    "account takeover", "hacked", "hijack", "akaun digodam", "digodam", "盗号", "被盗",
    "கணக்கு", "stolen account", "locked out", "otp hijack",
  ]),
];

/* ------------------------------------------------------------------ tactic */

export const TACTIC_TAGS: Tag[] = [
  tag("Urgency", "Urgency", "tactic", "tangerine", [
    "urgent", "urgency", "rush", "hurry", "10 minutes", "segera", "cepat", "紧急", "அவசரம்",
    "act now", "immediately", "expire", "countdown",
  ]),
  tag("FOMO", "FOMO", "tactic", "tangerine", [
    "fomo", "limited", "last chance", "slot", "terhad", "peluang terakhir", "限时", "名额",
    "missing out", "everyone is making",
  ]),
  tag("OTPRequest", "OTP Request", "tactic", "tangerine", [
    "otp", "otp request", "one time password", "tac", "verification code", "kod", "nombor tac",
    "验证码", "ஓடிபி", "six digit code", "share the code",
  ]),
  tag("SuspiciousLink", "Suspicious Link", "tactic", "tangerine", [
    "link", "suspicious link", "url", "short link", "pautan", "klik", "链接", "இணைப்பு",
    "fake website", "lookalike site", "apk", "download app",
  ]),
  tag("AuthorityImpersonation", "Authority Impersonation", "tactic", "tangerine", [
    "authority", "authority impersonation", "bank officer", "government", "court",
    "pihak berkuasa", "polis", "官方", "执法", "அதிகாரம்", "case number", "investigation", "badge",
  ]),
  tag("TooGoodToBeTrue", "Too Good To Be True", "tactic", "tangerine", [
    "too good", "too good to be true", "guaranteed", "won", "prize", "free", "jackpot", "menang",
    "hadiah", "percuma", "中奖", "免费", "பரிசு", "double your money",
  ]),
  tag("AdvancePayment", "Advance Payment", "tactic", "tangerine", [
    "advance payment", "pay first", "deposit", "processing fee", "admin fee", "bayar dahulu",
    "deposit dulu", "预付", "手续费", "முன்பணம்", "release fee", "activation fee",
  ]),
];

/* ---------------------------------------------------------------- platform */

const PLATFORM_SYNONYMS: Record<Platform, string[]> = {
  WhatsApp: ["whatsapp", "wa", "whats app", "wasap", "group chat wa"],
  Telegram: ["telegram", "tele", "tg", "telegram group"],
  Facebook: ["facebook", "fb", "face book", "fb group", "muka buku"],
  TikTok: ["tiktok", "tik tok", "douyin", "抖音"],
  Instagram: ["instagram", "ig", "insta", "instagram dm"],
  Reddit: ["reddit", "subreddit", "reddit thread"],
};

export const PLATFORM_TAGS: Tag[] = (Object.keys(PLATFORM_SYNONYMS) as Platform[]).map((platform) =>
  tag(platform, platform, "platform", "purple", PLATFORM_SYNONYMS[platform])
);

export const TAG_PLATFORM: Record<string, Platform> = Object.fromEntries(
  (Object.keys(PLATFORM_SYNONYMS) as Platform[]).map((platform) => [platform, platform])
) as Record<string, Platform>;

/* --------------------------------------------------------------- geography */

const STATE_SYNONYMS: Record<MyState, string[]> = {
  Johor: ["johor", "jb", "johor bahru", "柔佛"],
  Kedah: ["kedah", "alor setar"],
  Kelantan: ["kelantan", "kota bharu"],
  "Kuala Lumpur": ["kuala lumpur", "kl", "klang valley", "吉隆坡"],
  Melaka: ["melaka", "malacca", "马六甲"],
  "Negeri Sembilan": ["negeri sembilan", "seremban", "n9"],
  Pahang: ["pahang", "kuantan"],
  Penang: ["penang", "pulau pinang", "槟城"],
  Perak: ["perak", "ipoh", "霹雳"],
  Perlis: ["perlis", "kangar"],
  Sabah: ["sabah", "kota kinabalu", "沙巴"],
  Sarawak: ["sarawak", "kuching", "砂拉越"],
  Selangor: ["selangor", "shah alam", "petaling", "雪兰莪"],
  Terengganu: ["terengganu", "kuala terengganu"],
};

/** The id in the database strips the space: "Kuala Lumpur" -> "KualaLumpur". */
export const stateTagId = (state: MyState): string => state.replace(/[^A-Za-z]/g, "");

export const GEO_TAGS: Tag[] = (Object.keys(STATE_SYNONYMS) as MyState[]).map((state) =>
  tag(stateTagId(state), state, "geography", "lime", STATE_SYNONYMS[state])
);

export const TAG_STATE: Record<string, MyState> = Object.fromEntries(
  (Object.keys(STATE_SYNONYMS) as MyState[]).map((state) => [stateTagId(state), state])
) as Record<string, MyState>;

/* ---------------------------------------------------------------- language */

export const LANG_TAG: Record<Lang, string> = {
  bm: "BM",
  en: "English",
  zh: "Chinese",
  ta: "Tamil",
};

export const TAG_LANG: Record<string, Lang> = {
  BM: "bm",
  English: "en",
  Chinese: "zh",
  Tamil: "ta",
};

export const LANG_TAGS: Tag[] = [
  tag("BM", "BM", "language", "navy", ["bm", "malay", "bahasa", "bahasa melayu", "melayu"]),
  tag("English", "English", "language", "navy", ["english", "eng", "in english"]),
  tag("Chinese", "中文", "language", "navy", ["chinese", "mandarin", "中文", "华语", "cina"]),
  tag("Tamil", "தமிழ்", "language", "navy", ["tamil", "தமிழ்", "in tamil"]),
];

/* ------------------------------------------------------- category bridging */

/** A scam category and its scam_type tag are the same statement. */
export const CATEGORY_TAG: Record<Category, string> = {
  "Fake Job": "FakeJob",
  "Parcel Scam": "ParcelScam",
  "Investment Scam": "InvestmentScam",
  "AI Voice": "AIVoice",
  Impersonation: "Impersonation",
  "E-commerce Scam": "E-commerceScam",
  "Romance Scam": "RomanceScam",
  "Loan Scam": "LoanScam",
  "Account Takeover": "AccountTakeover",
};

export const TAG_CATEGORY: Record<string, Category> = Object.fromEntries(
  Object.entries(CATEGORY_TAG).map(([category, id]) => [id, category as Category])
) as Record<string, Category>;

/* ------------------------------------------------------------ the registry */

export const ALL_TAGS: Tag[] = [
  ...TYPE_TAGS,
  ...TACTIC_TAGS,
  ...PLATFORM_TAGS,
  ...GEO_TAGS,
  ...LANG_TAGS,
];

export const TAG_BY_ID = new Map(ALL_TAGS.map((item) => [item.id, item]));

export const TAG_IDS: string[] = ALL_TAGS.map((item) => item.id);

/** The one gate. Anything not in the taxonomy is dropped, never rendered. */
export function isKnownTag(id: string): boolean {
  return TAG_BY_ID.has(id);
}

/** Accepts an id, a label, or a "#Tag" — returns the canonical id or null. */
export function resolveTagId(raw: string): string | null {
  const cleaned = raw.trim().replace(/^#/, "");
  if (!cleaned) return null;
  if (TAG_BY_ID.has(cleaned)) return cleaned;
  const lower = cleaned.toLowerCase();
  const byId = ALL_TAGS.find((item) => item.id.toLowerCase() === lower);
  if (byId) return byId.id;
  const byLabel = ALL_TAGS.find((item) => item.label.toLowerCase() === lower);
  return byLabel ? byLabel.id : null;
}

/** Filters a candidate list (a model's output, a URL param) down to real tags. */
export function sanitiseTags(input: unknown, limit = 12): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const id = resolveTagId(raw);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= limit) break;
  }
  return out;
}

export function tagLabel(id: string): string {
  return TAG_BY_ID.get(id)?.label ?? id;
}

export function tagFacet(id: string): TagFacet | null {
  return TAG_BY_ID.get(id)?.facet ?? null;
}

export function tagsByFacet(facet: TagFacet): Tag[] {
  return ALL_TAGS.filter((item) => item.facet === facet);
}

/** Powers the "search existing tags before creating a new one" input. */
export function searchTags(query: string, limit = 8): Tag[] {
  const q = query.trim().toLowerCase().replace(/^#/, "");
  if (!q) return [];
  return ALL_TAGS.map((item) => {
    const label = item.label.toLowerCase();
    const id = item.id.toLowerCase();
    let score = 0;
    if (label === q || id === q) score = 100;
    else if (label.startsWith(q) || id.startsWith(q)) score = 70;
    else if (label.includes(q) || id.includes(q)) score = 45;
    else if (item.synonyms.some((s) => s.includes(q))) score = 30;
    return { item, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, limit)
    .map((row) => row.item);
}
