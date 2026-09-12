"use client";

import { useState } from "react";
import { Check, ImagePlus, Loader2, ShieldAlert, X } from "lucide-react";
import { Card, Field, buttonClass, cn, inputClass, selectClass } from "@/components/ui";
import { TagInput } from "./tag-input";
import { CATEGORIES, LANGS, LANG_FULL, LOSS_OPTIONS, OTHER, PLATFORMS, STATES } from "@/lib/data/types";

/**
 * The submission form, used in two modes.
 *
 * "story" is the Join the Gang flow: it posts straight to Community Stories, so
 * the form leans hard on the redaction warnings before the fact — once it is
 * live, there is no moderator standing between the text and the feed.
 *
 * "report" is the private report on the I-kena-already page. It is never
 * published, and it does not ask for a title or offer an anonymity toggle
 * because it is private by definition.
 *
 * The success state says which of those just happened, plainly. Telling someone
 * their story is under review when it is already public would be worse than
 * saying nothing.
 */

type Mode = "report" | "story";

export function ReportForm({ mode }: { mode: Mode }) {
  const isStory = mode === "story";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("en");
  const [lossRange, setLossRange] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const [consent, setConsent] = useState(false);
  const [images, setImages] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (body.trim().length < 30) {
      setError("Please describe what happened in a bit more detail.");
      return;
    }
    if (isStory && title.trim().length < 6) {
      setError("Give your story a short title so others can recognise the pattern.");
      return;
    }
    if (!consent) {
      setError("Please tick the consent box so we know how to handle your submission.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: isStory ? "community_story" : "private_report",
          title: isStory ? title.trim() : "Private report",
          body: body.trim(),
          category: category || null,
          platform: platform || null,
          state: state || null,
          language,
          lossRange: lossRange || null,
          tags,
          aiSuggestedTags: aiTags,
          anonymous: isStory ? anonymous : true,
          consent,
          hasAttachment: images.length > 0,
          images: images.map((image) => image.dataUrl),
        }),
      });
      if (!response.ok) throw new Error("submit failed");
      setDone(true);
    } catch {
      setError("Something went wrong sending that. Nothing was submitted — please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Card className="p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-pill bg-safe-soft px-3.5 py-2 text-micro font-extrabold text-safe-deep">
          <Check className="h-4 w-4" strokeWidth={2.6} aria-hidden="true" />
          {isStory ? "Posted" : "Received"}
        </p>
        <h2 className="mt-4 font-display text-h2">
          {isStory
            ? "Your tea is live. Someone might recognise it."
            : "Received. This stays private — it is never published."}
        </h2>
        <div className="mt-4 grid gap-3 text-body text-ink-muted">
          {isStory ? (
            <>
              <p>
                Your story is now in{" "}
                <span className="font-semibold text-ink">Community Stories</span>, posted{" "}
                {anonymous ? "anonymously" : "under the name you gave"}. It is labelled as a
                community post so readers can tell it apart from the stories we collected and redacted.
              </p>
              <p>
                A moderator reviews community posts after the fact and can take one down. If you
                included something you would rather remove, use the correction or removal action on
                the story.
              </p>
            </>
          ) : (
            <>
              <p>
                This report is held with status{" "}
                <span className="font-semibold text-ink">pending_review</span> and is{" "}
                <span className="font-semibold text-ink">not public</span>. Private reports are
                never published — they are used only to understand the pattern.
              </p>
              <p>
                If you would rather your story be public so others can recognise it, post it through{" "}
                <a href="/share" className="font-semibold text-purple-700 hover:underline">
                  Share your story
                </a>{" "}
                instead.
              </p>
            </>
          )}

        </div>

        {isStory ? (
          <a href="/share?tab=community" className={cn(buttonClass("dark", "md"), "mt-5")}>
            See it in Community Stories
          </a>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={submit} className="grid gap-4">
        {isStory ? (
          <Field label="Story title" htmlFor="f-title" required hint="Short and recognisable.">
            <input
              id="f-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. The parcel fee that wanted my card's back number"
              className={inputClass}
              maxLength={120}
            />
          </Field>
        ) : null}

        <Field
          label="What happened?"
          htmlFor="f-body"
          required
          hint={
            isStory
              ? "This posts publicly, so please leave out names, phone numbers, account numbers and addresses — yours and anyone else's. Describe the method, not the person."
              : "Please do not include names, phone numbers, account numbers or addresses — yours or anyone else's."
          }
        >
          <textarea
            id="f-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={6}
            placeholder="Describe the pattern: how they made contact, what they asked for, and what made you suspicious."
            className={cn(inputClass, "min-h-[140px] resize-y")}
            maxLength={4000}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Scam type" htmlFor="f-category">
            <select
              id="f-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={selectClass}
            >
              <option value="">Not sure</option>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Where it happened" htmlFor="f-platform">
            <select
              id="f-platform"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className={selectClass}
            >
              <option value="">Prefer not to say</option>
              {PLATFORMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
              <option value={OTHER}>Others</option>
            </select>
          </Field>

          <Field label="State" htmlFor="f-state">
            <select
              id="f-state"
              value={state}
              onChange={(event) => setState(event.target.value)}
              className={selectClass}
            >
              <option value="">Prefer not to say</option>
              {STATES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Language you experienced it in" htmlFor="f-language">
            <select
              id="f-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className={selectClass}
            >
              {LANGS.map((item) => (
                <option key={item} value={item}>
                  {LANG_FULL[item]}
                </option>
              ))}
              <option value={OTHER}>Others</option>
            </select>
          </Field>

          <Field
            label="Approximate loss"
            htmlFor="f-loss"
            hint="Optional. A range only — never an exact figure."
          >
            <select
              id="f-loss"
              value={lossRange}
              onChange={(event) => setLossRange(event.target.value)}
              className={selectClass}
            >
              <option value="">Prefer not to say</option>
              {LOSS_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <TagInput
          value={tags}
          onChange={setTags}
          draftText={`${title} ${body}`}
          suggestedFromAi={aiTags}
          onAiSuggested={setAiTags}
        />

        {/* ------------------------------------------------------- screenshot */}
        <div className="grid gap-2">
          <span className="text-micro font-bold text-ink">
            Screenshots or memes (optional, up to 3)
          </span>
          <div className="rounded-card border border-dashed border-line bg-paper-tint p-4">
            {images.length ? (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={image.name + index} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="aspect-square w-full rounded-chip border border-line object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      aria-label={`Remove ${image.name}`}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-pill bg-ink/80 text-white transition hover:bg-ink"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {images.length < 3 ? (
              <label className="flex cursor-pointer items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-white">
                  <ImagePlus className="h-5 w-5 text-purple-600" strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-body font-bold">
                    {images.length ? "Add another" : "Attach a screenshot or meme"}
                  </span>
                  <span className="block text-micro text-ink-muted">
                    Shown publicly on your post. Images stay in your browser and are sent with the
                    story.
                  </span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={async (event) => {
                    const files = Array.from(event.target.files ?? []).slice(0, 3 - images.length);
                    const read = await Promise.all(
                      files.map(
                        (file) =>
                          new Promise<{ name: string; dataUrl: string } | null>((resolve) => {
                            // Anything past ~1.5MB would bloat the payload, and a
                            // phone screenshot is comfortably under it.
                            if (file.size > 1_500_000) return resolve(null);
                            const reader = new FileReader();
                            reader.onload = () =>
                              resolve({ name: file.name, dataUrl: String(reader.result) });
                            reader.onerror = () => resolve(null);
                            reader.readAsDataURL(file);
                          })
                      )
                    );
                    const kept = read.filter((item): item is { name: string; dataUrl: string } =>
                      Boolean(item)
                    );
                    if (kept.length < files.length) {
                      setError("Some images were over 1.5MB and were skipped.");
                    }
                    setImages([...images, ...kept]);
                    event.target.value = "";
                  }}
                />
              </label>
            ) : null}
          </div>
          <p className="flex items-start gap-2 rounded-chip bg-caution-soft px-3.5 py-2.5 text-micro font-semibold text-caution-deep">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            <span>
              Please blur IC numbers, banking details, addresses, passwords, OTPs, and private chats
              before attaching anything.
            </span>
          </p>
        </div>

        {/* ---------------------------------------------------------- consent */}
        {isStory ? (
          <label className="flex items-start gap-3 rounded-card border border-line bg-white p-4">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-purple-600"
            />
            <span className="min-w-0">
              <span className="block text-body font-bold">Post anonymously</span>
              <span className="mt-0.5 block text-micro text-ink-muted">
                On by default, and the safer choice — your story posts to the feed with no name
                attached.
              </span>
            </span>
          </label>
        ) : null}

        <label className="flex items-start gap-3 rounded-card border border-line bg-white p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-purple-600"
            required
          />
          <span className="min-w-0">
            <span className="block text-body font-bold">
              {isStory
                ? "I understand this posts to Community Stories straight away"
                : "I understand this report is private and is used only to understand the pattern"}
            </span>
            <span className="mt-0.5 block text-micro text-ink-muted">
              {isStory
                ? "Please leave out names, phone numbers, account numbers, addresses and accusations about identifiable people or businesses — there is no moderator between your words and the feed. A moderator can take a post down afterwards, and you can request removal at any time."
                : "This is never published. Personal and identifying details are still best left out."}
            </span>
          </span>
        </label>

        {error ? (
          <p role="alert" className="text-body font-semibold text-risk">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className={cn(buttonClass(isStory ? "hot" : "dark", "lg"), "justify-self-start")}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isStory ? "Share my story" : "Send private report"}
        </button>
      </form>
    </Card>
  );
}
