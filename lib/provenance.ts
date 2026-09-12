import type { ConsentStatus, CreditPreference, Platform, Story, StorySource } from "./data/types";

/**
 * The one place the creator-credit rules are enforced.
 *
 * Every surface that could possibly show where a story came from — the card
 * badge, the detail page's Source card, a chatbot citation, the weekly digest,
 * a share card — calls publicAttributionFor() and renders only what comes back.
 * Nothing reads creatorHandle, creatorDisplayName or sourceUrl off a
 * StorySource directly.
 *
 * That single-chokepoint design is the point: attribution suppressed in one
 * place stays suppressed everywhere, and a creator who withdraws consent
 * disappears from the whole site at once rather than from whichever components
 * someone remembered to update.
 *
 * The rules, in order:
 *   1. A story whose source review status is not "approved" (withdrawn,
 *      removed, still pending) shows NO attribution and NO source media.
 *   2. A name, handle or link may appear ONLY for creator_submitted or
 *      creator_consented. Public discussion that was merely observed is never
 *      credited, linked, quoted or screenshotted.
 *   3. creditPreference then narrows further: anonymous shows nothing,
 *      platform_only shows the platform alone, handle_and_link shows both.
 *   4. An official source credits the organisation, never a person.
 */

export type PublicAttribution = {
  /** The state label shown on the Source card. */
  statusLabel: string;
  /** The one-line permission statement under it. */
  permissionLine: string;
  /** Compact badge text used on story cards. */
  badge: string;
  badgeTone: "lavender" | "mint" | "blue" | "ink" | "amber";
  platformLabel: string;
  /** Null unless the consent and credit rules allow a name. */
  creatorName: string | null;
  /** Null unless the creator chose handle_and_link. */
  creatorHandle: string | null;
  /** Null unless a link is permitted. */
  sourceUrl: string | null;
  /** Only ever set for an official / published source. */
  organisation: string | null;
  /** True when this story is a reviewed pattern lead, never a republication. */
  isPatternOnly: boolean;
  /** Shown on any credited demo story, per the prototype labelling rule. */
  demoNotice: string | null;
  /** Whether the "Request correction or removal" action should be offered. */
  allowsCorrectionRequest: boolean;
};

const STATUS_LABEL: Record<ConsentStatus, string> = {
  creator_submitted: "Creator-submitted story",
  creator_consented: "Shared with creator permission",
  official_source: "Official advisory",
  public_lead_not_republished: "Pattern informed by reviewed public discussion",
  demo: "Curated demo story",
};

const BADGE: Record<ConsentStatus, { text: string; tone: PublicAttribution["badgeTone"] }> = {
  creator_submitted: { text: "Creator submitted", tone: "mint" },
  creator_consented: { text: "Creator consented", tone: "lavender" },
  official_source: { text: "Official advisory", tone: "blue" },
  public_lead_not_republished: { text: "Public lead", tone: "amber" },
  demo: { text: "Curated demo", tone: "ink" },
};

/** Spelled out per preference, so the card says why a name is or is not shown. */
const CREDIT_LINE: Record<CreditPreference, string> = {
  anonymous: "The creator asked to stay anonymous, so no name, handle or link is shown.",
  platform_only:
    "The creator asked for platform-only credit, so the platform is named and they are not.",
  handle_and_link: "The creator opted in to being credited.",
};

const PERMISSION_LINE: Record<ConsentStatus, string> = {
  creator_submitted: "Submitted to Kena Scam by the person it happened to.",
  creator_consented: "Shared with permission.",
  official_source: "Summarised from a published advisory, in our own words.",
  public_lead_not_republished:
    "Not republished. No creator, handle, screenshot or post text is shown — only the pattern.",
  demo: "Written by Kena Scam for this prototype. No external source.",
};

/** Credit is permitted only for these two states. */
const CREDITABLE: ConsentStatus[] = ["creator_submitted", "creator_consented"];

export function publicAttributionFor(
  source: StorySource | undefined,
  fallbackPlatform?: Platform
): PublicAttribution {
  const platform = source?.platform ?? fallbackPlatform ?? "Facebook";
  const platformLabel = platform;

  /* No record at all, or a record that is not approved for publication. A
     withdrawn or removed story keeps its safety content but loses every trace
     of who it came from. */
  if (!source || source.reviewStatus !== "approved") {
    return {
      statusLabel: "Attribution withdrawn",
      permissionLine:
        "Credit and source media for this story have been removed at the creator's request. The pattern and safety guidance remain.",
      badge: "Attribution withdrawn",
      badgeTone: "ink",
      platformLabel,
      creatorName: null,
      creatorHandle: null,
      sourceUrl: null,
      organisation: null,
      isPatternOnly: true,
      demoNotice: null,
      allowsCorrectionRequest: true,
    };
  }

  const creditable = CREDITABLE.includes(source.consentStatus);
  // "platform_only" means exactly that: we may say where it was shared, and
  // nothing about who shared it. Only "handle_and_link" permits a name.
  const showHandleAndLink = creditable && source.creditPreference === "handle_and_link";
  const showName = showHandleAndLink;
  const isOfficial = source.consentStatus === "official_source";

  return {
    statusLabel: STATUS_LABEL[source.consentStatus],
    permissionLine: creditable
      ? `${PERMISSION_LINE[source.consentStatus]} ${CREDIT_LINE[source.creditPreference]}`
      : PERMISSION_LINE[source.consentStatus],
    badge: BADGE[source.consentStatus].text,
    badgeTone: BADGE[source.consentStatus].tone,
    platformLabel,
    creatorName: showName ? source.creatorDisplayName : null,
    creatorHandle: showHandleAndLink ? source.creatorHandle : null,
    // An official source may link its own publication; a creator link needs
    // handle_and_link. A public lead never links anywhere.
    sourceUrl: isOfficial ? source.sourceUrl : showHandleAndLink ? source.sourceUrl : null,
    organisation: isOfficial ? organisationFrom(source.notes) : null,
    isPatternOnly: source.consentStatus === "public_lead_not_republished",
    demoNotice: creditable ? "Demo creator-consented story — fictionalised for prototype." : null,
    allowsCorrectionRequest: true,
  };
}


/**
 * An official source records its publication in the notes column. Pulling the
 * name out here keeps the parsing in one place next to the rule that decides
 * whether an organisation may be shown at all.
 */
function organisationFrom(notes: string | null): string | null {
  if (!notes) return null;
  const match = /^(.+?\(fictional\))/.exec(notes);
  return match ? match[1].trim() : null;
}

/**
 * A story bundled with the attribution the consent rules permit.
 *
 * Components never compute attribution themselves — they render this. Pairing
 * the two means every surface showing a story shows the same answer to "may we
 * say where this came from", including the client components the feed hands
 * stories to.
 */
export type StoryView = Story & { attribution: PublicAttribution };
