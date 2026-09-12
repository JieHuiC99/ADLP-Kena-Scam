"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Bookmark, Check, Heart, Languages, Share2, ShieldCheck } from "lucide-react";
import { Card, Disclaimer, SusMeter, buttonClass, cn } from "@/components/ui";
import { CategoryChip, LangChip, PlatformChip, TagChip } from "@/components/ui/chips";
import { SourceProvenance } from "./source-provenance";
import { Mascot } from "@/components/ui/mascot";
import { LANGS, LANG_ATTR, LANG_FULL, LANG_LABEL } from "@/lib/data/types";
import type { Lang, Story } from "@/lib/data/types";
import type { PublicAttribution } from "@/lib/provenance";
import { formatDate, timeAgo } from "@/lib/format";

/**
 * Story detail.
 *
 * The original text is always the default view and is never replaced — the
 * toggle switches between "Original" and a translation, and switching back is
 * always one click away. That matters because the original wording IS the
 * evidence: the phrasing an uncle used on Facebook in BM is part of what makes
 * it recognisable to the next person who sees it.
 */
export function StoryDetail({
  story,
  attribution,
}: {
  story: Story;
  attribution: PublicAttribution;
}) {
  const [lang, setLang] = useState<Lang | "original">("original");
  const [reacted, setReacted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const showing: Lang = lang === "original" ? story.originalLanguage : lang;
  const isOriginal = lang === "original" || lang === story.originalLanguage;
  const body = story.translations[showing];
  const heading = story.titleTranslations[showing];

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: story.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* The user dismissed the share sheet. Nothing to recover from. */
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="min-w-0">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-1.5 px-5 pt-5 sm:px-7">
            <PlatformChip platform={story.platform} />
            <LangChip lang={story.originalLanguage} withLabel />
            <CategoryChip category={story.category} />
          </div>

          <div className="px-5 pt-4 sm:px-7">
            <h1 className="font-display text-h1">{heading}</h1>
            <p className="mt-3 text-lede text-ink-muted">{story.summary}</p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-ink-muted">
              <span>{story.state}</span>
              <span aria-hidden="true">·</span>
              <span>{story.lossRange}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={story.date} title={formatDate(story.date)}>
                {timeAgo(story.date)}
              </time>
            </p>
          </div>

          {/* --------------------------------------------- translate lah */}
          <div className="mx-5 mt-5 rounded-card border border-line bg-paper-tint p-4 sm:mx-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-micro font-bold text-ink">
                <Mascot pose="global-language-translator" size="xs" className="w-8" />
                <Languages className="h-4 w-4 text-purple-600" strokeWidth={2.4} aria-hidden="true" />
                Translate lah
              </p>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Story language">
                <button
                  type="button"
                  onClick={() => setLang("original")}
                  aria-pressed={lang === "original"}
                  className={cn(
                    "rounded-pill px-3 py-1.5 text-[11px] font-extrabold transition",
                    lang === "original"
                      ? "bg-ink text-white"
                      : "bg-white text-ink-muted hover:text-purple-700"
                  )}
                >
                  Original ({LANG_LABEL[story.originalLanguage]})
                </button>
                {LANGS.filter((item) => item !== story.originalLanguage).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLang(item)}
                    aria-pressed={lang === item}
                    className={cn(
                      "rounded-pill px-3 py-1.5 text-[11px] font-extrabold transition",
                      lang === item
                        ? "bg-purple-600 text-white"
                        : "bg-white text-ink-muted hover:text-purple-700"
                    )}
                  >
                    {LANG_LABEL[item]}
                  </button>
                ))}
              </div>
            </div>

            <p
              lang={LANG_ATTR[showing]}
              className="mt-3.5 whitespace-pre-line text-[15px] leading-[1.7] text-ink wrap-anywhere"
            >
              {body}
            </p>

            <p className="mt-3 text-micro text-ink-muted">
              {isOriginal ? (
                <>
                  Showing the story as originally told in{" "}
                  <span className="font-semibold text-ink">{LANG_FULL[story.originalLanguage]}</span>.
                </>
              ) : (
                <>
                  Translated into{" "}
                  <span className="font-semibold text-ink">{LANG_FULL[showing]}</span>. Translation
                  may be AI-assisted. The original is always one tap away.
                </>
              )}
            </p>
          </div>

          {/* --------------------------------------------------- reactions */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line-soft px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={() => setReacted((value) => !value)}
              aria-pressed={reacted}
              className={cn(
                buttonClass("ghost", "sm"),
                reacted && "border-hot bg-hot-soft text-hot-deep"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", reacted && "fill-current")} strokeWidth={2.4} />
              {(story.reactions + (reacted ? 1 : 0)).toLocaleString()}
            </button>
            <button
              type="button"
              onClick={() => setSaved((value) => !value)}
              aria-pressed={saved}
              className={cn(
                buttonClass("ghost", "sm"),
                saved && "border-purple-400 bg-purple-50 text-purple-700"
              )}
            >
              <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} strokeWidth={2.4} />
              {saved ? "Saved" : "Save"}
            </button>
            <button type="button" onClick={share} className={buttonClass("ghost", "sm")}>
              {copied ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.6} />
              ) : (
                <Share2 className="h-3.5 w-3.5" strokeWidth={2.4} />
              )}
              {copied ? "Link copied" : "Share"}
            </button>
            <span className="text-micro text-ink-muted">
              Reactions are saved to your browser.
            </span>
          </div>
        </Card>

        {/* ------------------------------------------------------- red flags */}
        <Card className="mt-5 overflow-hidden">
          <h2 className="flex items-center gap-2 border-b border-line-soft px-5 py-4 text-h3 sm:px-7">
            <AlertTriangle className="h-4 w-4 text-hot" strokeWidth={2.4} aria-hidden="true" />
            The red flags
          </h2>
          <ul className="grid gap-2.5 px-5 py-4 sm:px-7">
            {story.redFlags.map((flag) => (
              <li key={flag} className="flex items-start gap-2.5 text-body">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-hot"
                  aria-hidden="true"
                />
                <span>{flag}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-line-soft bg-safe-soft px-5 py-4 sm:px-7">
            <p className="flex items-start gap-2.5 text-body font-semibold text-safe-deep">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
              <span>{story.safeAction}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* ----------------------------------------------------------- sidebar */}
      <div className="grid min-w-0 content-start gap-5">
        <Card className="p-5">
          <SusMeter score={story.susScore} />
          <p className="mt-3 text-micro text-ink-muted">
            How strongly this story matches patterns we already have on record. It is a reading of
            the pattern, not a verdict about any person, business or account.
          </p>
        </Card>

        <SourceProvenance attribution={attribution} storyTitle={story.title} storyId={story.id} />

        <Card className="p-5">
          <h2 className="text-h3">Tags</h2>
          <p className="mt-1 text-micro text-ink-muted">
            Tap any tag to see every other telling of it.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {story.tags.map((tag) => (
              <TagChip key={tag} id={tag} href={`/tea?tags=${encodeURIComponent(tag)}`} />
            ))}
          </div>
          {story.aiSuggestedTags.length ? (
            <p className="mt-3 border-t border-line-soft pt-3 text-micro text-ink-muted">
              {story.aiSuggestedTags.length} of these were AI suggested and confirmed by a moderator
              before publication.
            </p>
          ) : null}
        </Card>

        <Disclaimer />

        <Link href="/tea" className={cn(buttonClass("ghost", "md"), "justify-self-start")}>
          ← Back to the feed
        </Link>
      </div>
    </div>
  );
}
