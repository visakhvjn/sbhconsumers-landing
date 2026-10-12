import { z } from "zod";

export const STARTERS = [
  "Build AM/PM skincare routines for your skin type",
  "Explain ingredients like salicylic acid, niacinamide & retinol",
  "Recommend products with buy links from Flipkart, Nykaa & Amazon India",
  "Help with acne, dryness, dark spots, sunscreen & shaving irritation",
];

const Text = z.object({ t: z.enum(["p", "note"]), x: z.string() });
const List = z.object({ t: z.enum(["ul", "ol"]), i: z.array(z.string()) });
const Routine = z.object({ t: z.literal("routine"), am: z.array(z.string()), pm: z.array(z.string()) });
const Tags = z.object({ t: z.literal("tags"), i: z.array(z.string()) });
const Shop = z.object({ t: z.literal("shop"), q: z.string() });
const Chips = z.object({
  t: z.literal("chips"),
  o: z.array(z.object({ label: z.string(), say: z.string() })),
});

export const Reply = z.object({
  blocks: z.array(z.discriminatedUnion("t", [Text, List, Routine, Tags, Shop, Chips])),
});

export type ModelBlock = z.infer<typeof Reply>["blocks"][number];

export type Links = { t: "links"; l: { label: string; href: string }[] };
export type Block = Exclude<ModelBlock, z.infer<typeof Shop>> | Links;

export type ChatMessage = { role: "user" | "assistant"; text: string };

export type ChatResponse = { blocks: Block[]; runId?: string; startTime?: number };

export const ChatRequest = z.object({
  sessionId: z.string().min(1).max(100),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().min(1).max(4000) }))
    .min(1)
    .max(20)
    .refine((m) => m[m.length - 1].role === "user" && m[m.length - 1].text.length <= 1000, {
      message: "Last message must be a user message of at most 1000 characters",
    }),
});

export function shopLinks(query: string): Links {
  const q = encodeURIComponent(query);
  return {
    t: "links",
    l: [
      { label: "Flipkart", href: `https://www.flipkart.com/search?q=${q}` },
      { label: "Nykaa", href: `https://www.nykaa.com/search/result/?q=${q}` },
      { label: "Amazon India", href: `https://www.amazon.in/s?k=${q}` },
    ],
  };
}

/** Flattens a bot reply into plain text so it can be sent back as conversation history. */
export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      switch (b.t) {
        case "p":
        case "note":
          return b.x;
        case "ul":
        case "ol":
          return b.i.map((s) => `- ${s}`).join("\n");
        case "routine":
          return `AM: ${b.am.join("; ")}\nPM: ${b.pm.join("; ")}`;
        case "tags":
          return `Look for: ${b.i.join(", ")}`;
        case "links":
          return `Shop links: ${b.l.map((x) => x.label).join(", ")}`;
        case "chips":
          return `Suggested follow-ups: ${b.o.map((c) => c.label).join(", ")}`;
      }
    })
    .join("\n")
    .slice(0, 4000);
}
