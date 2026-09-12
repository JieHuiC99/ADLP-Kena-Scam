"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { cn, inputClass } from "@/components/ui";
import { TagChip } from "@/components/ui/chips";
import { Mascot } from "@/components/ui/mascot";
import { searchTags, tagLabel } from "@/lib/data/taxonomy";
import { suggestTags } from "@/lib/search/query";

/**
 * The tag input for "Share Your Story".
 *
 * Two rules shape this component. First, tags come only from the controlled
 * taxonomy — the input searches existing tags before anything can be added, and
 * there is no free-text escape hatch, so a submission cannot carry a tag naming
 * a person, business, account or phone number.
 *
 * Second, AI suggestions are proposals, never decisions. "Auto-tag my tea"
 * fills the list with editable chips marked "AI suggested"; every one can be
 * removed, and suggesting never submits or publishes anything.
 */
export function TagInput({
  value,
  onChange,
  draftText,
  suggestedFromAi,
  onAiSuggested,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  /** The story text the auto-tagger reads. */
  draftText: string;
  suggestedFromAi: string[];
  onAiSuggested: (tags: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = searchTags(query, 6).filter((tag) => !value.includes(tag.id));

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const add = (id: string) => {
    if (!value.includes(id)) onChange([...value, id]);
    setQuery("");
    setOpen(false);
  };

  const remove = (id: string) => {
    onChange(value.filter((tag) => tag !== id));
    onAiSuggested(suggestedFromAi.filter((tag) => tag !== id));
  };

  /**
   * Ask the server to propose tags. The route validates every id against the
   * taxonomy before returning, and the local tagger below is the fallback when
   * no key is configured — so this button always does something useful.
   */
  const autoTag = async () => {
    const text = draftText.trim();
    if (text.length < 20) {
      setNotice("Write a bit more of your story first — at least a sentence or two.");
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      const response = await fetch("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = response.ok
        ? ((await response.json()) as { tags?: string[]; engine?: string })
        : { tags: [] };
      const proposed = data.tags?.length ? data.tags : suggestTags(text);
      if (!proposed.length) {
        setNotice("Could not find a confident match. Add tags yourself below.");
        return;
      }
      const merged = Array.from(new Set([...value, ...proposed]));
      onChange(merged);
      onAiSuggested(proposed.filter((tag) => !value.includes(tag)));
      setNotice(
        `${proposed.length} tags suggested${data.engine === "openai" ? "" : " from your wording"}. Edit or remove any of them.`
      );
    } catch {
      const local = suggestTags(text);
      if (local.length) {
        onChange(Array.from(new Set([...value, ...local])));
        onAiSuggested(local);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-micro font-bold text-ink">
          <Mascot pose="automated-content-tagging" size="xs" className="w-8" />
          Tags
        </span>
        <button
          type="button"
          onClick={autoTag}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-pill border-2 border-ink bg-lime px-3 py-1.5 text-micro font-extrabold text-ink shadow-stamp transition hover:brightness-95 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
          )}
          Auto-tag my tea ✨
        </button>
      </div>

      {value.length ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => {
            const fromAi = suggestedFromAi.includes(id);
            return (
              <span key={id} className="inline-flex items-center">
                <TagChip
                  id={id}
                  onClick={() => remove(id)}
                  suffix={<X className="ml-0.5 h-3 w-3" strokeWidth={3} />}
                  className={cn(fromAi && "ring-2 ring-lime")}
                />
                {fromAi ? (
                  <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                    AI suggested
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-micro text-ink-muted">
          No tags yet. Search below, or let us auto-tag the tea.
        </p>
      )}

      <div ref={boxRef} className="relative">
        <label htmlFor="tag-search" className="sr-only">
          Search existing tags
        </label>
        <input
          id="tag-search"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (matches[0]) add(matches[0].id);
            }
          }}
          placeholder="Search tags… e.g. parcel, OTP, Johor"
          className={inputClass}
          autoComplete="off"
        />

        {open && query.trim() ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-card border border-line bg-white p-1.5 shadow-lift">
            {matches.length ? (
              matches.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => add(tag.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-chip px-3 py-2 text-left transition hover:bg-paper-tint"
                >
                  <span className="text-body font-semibold">{tag.label}</span>
                  <span className="inline-flex items-center gap-1 text-micro text-ink-muted">
                    <Plus className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                    {tag.facet.replace("_", " ")}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2.5 text-micro text-ink-muted">
                No tag matches &ldquo;{query}&rdquo;. Kena Scam only uses a fixed list of scam types,
                tactics, platforms, states and languages — so nothing naming a person or business can
                be added.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {notice ? <p className="text-micro font-semibold text-purple-700">{notice}</p> : null}

      <p className="text-micro text-ink-muted">
        Tags come from a fixed vocabulary and are confirmed by a moderator before anything is
        published. Suggestions are marked{" "}
        <span className="font-semibold text-ink">AI suggested</span> and are always editable.
        {value.length ? ` Currently: ${value.map(tagLabel).join(", ")}.` : ""}
      </p>
    </div>
  );
}
