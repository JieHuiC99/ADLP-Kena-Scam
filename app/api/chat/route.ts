import { NextResponse } from "next/server";
import { z } from "zod";
import { MODEL, openai } from "@/lib/ai";
import { CHAT_SYSTEM_PROMPT, ground, groundingToContext, localAnswer } from "@/lib/chat";
import type { ChatReply } from "@/lib/data/types";

/**
 * Ask Kena Scam.
 *
 * Retrieval happens first, in lib/chat.ts, against the approved story and trend
 * records. The model only ever sees that evidence pack, and the citations
 * returned to the browser are the records that were actually retrieved — not
 * something the model claimed to have used. With no key the same evidence is
 * assembled into an answer locally, so the assistant is grounded identically
 * either way.
 */

const Body = z.object({
  question: z.string().min(2).max(500),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid question" }, { status: 400 });
  }

  const question = parsed.data.question;
  const grounding = await ground(question);
  const fallback: ChatReply = {
    answer: localAnswer(question, grounding),
    citations: grounding.citations,
    engine: "local",
  };

  const api = openai();
  if (!api) return NextResponse.json(fallback);

  const context = groundingToContext(grounding);

  try {
    const response = await api.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_completion_tokens: 420,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            "CONTEXT (the only records you may use):",
            context || "(no matching records)",
            "",
            grounding.isRecovery
              ? "NOTE: this person may have already lost money. Be calm and practical. No jokes."
              : "",
            "",
            `QUESTION: ${question}`,
          ].join("\n"),
        },
      ],
    });

    const answer = response.choices[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json(fallback);

    return NextResponse.json({
      answer,
      // Always the retrieved records, never anything the model named itself.
      citations: grounding.citations,
      engine: "openai",
    } satisfies ChatReply);
  } catch (error) {
    console.warn("[chat] falling back:", error instanceof Error ? error.message : error);
    return NextResponse.json(fallback);
  }
}
