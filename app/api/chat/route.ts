import { after } from "next/server";
import { zodTextFormat } from "openai/helpers/zod";
import { isTracingEnabled } from "langsmith";
import { getCurrentRunTree, traceable } from "langsmith/traceable";
import { getOpenAI, langsmith, OPENAI_MODEL } from "@/lib/ai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import {
  ChatRequest,
  Reply,
  shopLinks,
  type Block,
  type ChatMessage,
  type ChatResponse,
} from "@/lib/chat-schema";

async function skinGuideChat(messages: ChatMessage[]): Promise<ChatResponse> {
  const run = getCurrentRunTree(true);
  const response = await getOpenAI().responses.parse({
    model: OPENAI_MODEL,
    instructions: SYSTEM_PROMPT,
    input: messages.map((m) => ({ role: m.role, content: m.text })),
    text: { format: zodTextFormat(Reply, "reply") },
  });

  const parsed = response.output_parsed;
  if (!parsed || parsed.blocks.length === 0) throw new Error("Model returned no reply blocks");

  const blocks: Block[] = parsed.blocks.map((b) => (b.t === "shop" ? shopLinks(b.q) : b));
  const traced = run && isTracingEnabled();
  return {
    blocks,
    runId: traced ? run.id : undefined,
    startTime: traced ? run.start_time : undefined,
  };
}

export async function POST(request: Request) {
  const body = ChatRequest.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { sessionId, messages } = body.data;

  after(() => langsmith.awaitPendingTraceBatches());

  try {
    const result = await traceable(skinGuideChat, {
      name: "skin-guide-chat",
      run_type: "chain",
      client: langsmith,
      metadata: {
        session_id: sessionId,
        model: OPENAI_MODEL,
        user_agent: request.headers.get("user-agent") ?? undefined,
      },
    })(messages);
    return Response.json(result);
  } catch (err) {
    console.error("[api/chat]", err);
    return Response.json(
      { error: "The skin guide could not answer right now. Please try again." },
      { status: 500 },
    );
  }
}
