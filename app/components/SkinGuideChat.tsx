"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  blocksToText,
  STARTERS,
  type Block,
  type ChatMessage,
  type ChatResponse,
} from "@/lib/chat-schema";
import BotBlocks from "./BotMessage";

type Entry =
  | { id: number; role: "user"; text: string; shown: string }
  | { id: number; role: "assistant"; blocks: Block[]; runId?: string; startTime?: number; failed?: boolean };

type Rating = 0 | 1;

const ERROR_BLOCKS: Block[] = [
  { t: "p", x: "Something went wrong on my side. Please try again in a moment." },
];

let nextId = 0;

export default function SkinGuideChat() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [ratings, setRatings] = useState<Record<number, Rating>>({});
  const sessionId = useRef<string | null>(null);
  const generation = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (!log || entries.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [entries, busy]);

  async function send(say: string, shown?: string) {
    const text = say.trim();
    if (!text || busy) return;
    sessionId.current ??= crypto.randomUUID();
    const gen = generation.current;

    const user: Entry = { id: nextId++, role: "user", text, shown: shown ?? text };
    const history = [...entries, user];
    setEntries(history);
    setBusy(true);

    const messages: ChatMessage[] = history
      .filter((e) => e.role === "user" || !e.failed)
      .slice(-20)
      .map((e) =>
        e.role === "user"
          ? { role: "user", text: e.text }
          : { role: "assistant", text: blocksToText(e.blocks) },
      );

    let reply: Entry;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, messages }),
      });
      if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
      const data: ChatResponse = await res.json();
      reply = { id: nextId++, role: "assistant", ...data };
    } catch {
      reply = { id: nextId++, role: "assistant", blocks: ERROR_BLOCKS, failed: true };
    }
    if (gen !== generation.current) return;
    setEntries((prev) => [...prev, reply]);
    setBusy(false);
  }

  function rate(entry: Extract<Entry, { role: "assistant" }>, score: Rating) {
    if (!entry.runId || entry.id in ratings) return;
    setRatings((r) => ({ ...r, [entry.id]: score }));
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: entry.runId, startTime: entry.startTime, score }),
    }).catch(() => {});
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = input;
    setInput("");
    send(value);
  }

  function reset() {
    generation.current++;
    setEntries([]);
    setRatings({});
    setBusy(false);
    setInput("");
    sessionId.current = null;
    logRef.current?.scrollTo({ top: 0 });
  }

  const lastBotId = entries.findLast((e) => e.role === "assistant")?.id;

  return (
    <div className="chat" role="region" aria-label="SBH skin guide chat">
      <div className="chat-head">
        <span className="avatar" aria-hidden="true">
          S
        </span>
        <div>
          <b>SBH Skin Guide</b>
          <span>Routines, ingredients &amp; Indian product picks</span>
        </div>
        <button className="reset" type="button" onClick={reset}>
          New chat
        </button>
      </div>

      <div className="log" ref={logRef} role="log" aria-live="polite">
        <div className="msg bot greet">
          <h3>Hi, how can I help with your skin?</h3>
          <p>
            Welcome to the SBH Skin Guide. Ask me anything about routines, ingredients, or products —
            I&rsquo;ll find picks you can buy in India.
          </p>
          <ul className="starters">
            {STARTERS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => send(s)}>
                  <span className="tick">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                  <span>{s}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {entries.map((e) =>
          e.role === "user" ? (
            <div key={e.id} className="msg me">
              {e.shown}
            </div>
          ) : (
            <div key={e.id} className="msg bot">
              <BotBlocks
                blocks={e.blocks}
                chipsDisabled={busy || e.id !== lastBotId}
                onChip={(say, label) => send(say, label)}
              />
              {e.runId && (
                <div className="rate" role="group" aria-label="Was this helpful?">
                  {e.id in ratings ? (
                    <span>Thanks for the feedback.</span>
                  ) : (
                    <>
                      <span>Helpful?</span>
                      <button type="button" onClick={() => rate(e, 1)}>
                        Yes
                      </button>
                      <button type="button" onClick={() => rate(e, 0)}>
                        No
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ),
        )}

        {busy && (
          <div className="msg bot typing" aria-label="Typing">
            <i></i>
            <i></i>
            <i></i>
          </div>
        )}
      </div>

      <form className="compose" autoComplete="off" onSubmit={onSubmit}>
        <label className="vh" htmlFor="q">
          Ask about skincare
        </label>
        <input
          id="q"
          name="q"
          type="text"
          placeholder="Ask about skincare, routines, or products..."
          enterKeyHint="send"
          maxLength={1000}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="send" type="submit" aria-label="Send" disabled={busy}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <p className="fine">Not medical advice. For persistent issues, see a dermatologist.</p>
    </div>
  );
}
