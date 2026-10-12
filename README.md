# SBH Men's Skincare landing page

The landing page and AI skin guide for SBH. It is built with Next.js 16. The chat uses OpenAI, and every call is traced in LangSmith.

The original design is in `design/SBH Men's Skincare.html`.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAI key used by `/api/chat` |
| `OPENAI_MODEL` | Model for the skin guide (default `gpt-4o-mini`) |
| `LANGSMITH_TRACING` | Set to `true` to send traces to LangSmith |
| `LANGSMITH_API_KEY` | LangSmith API key |
| `LANGSMITH_PROJECT` | LangSmith project that traces and feedback go to (default `sbh-skin-guide`) |

## How it works

- `app/components/` contains the page sections (`Hero`, `GuideSection`, `Footer`) and the chat (`SkinGuideChat`, `BotMessage`).
- `POST /api/chat` sends the conversation to OpenAI using structured outputs (`lib/chat-schema.ts`). The model replies with typed blocks: paragraphs, lists, AM/PM routine cards, ingredient tags, shop searches and follow-up chips. The server turns shop searches into Flipkart, Nykaa and Amazon India links. The system prompt is in `lib/prompt.ts`.
- `POST /api/feedback` records the helpful or not-helpful buttons as LangSmith feedback with the key `helpful`.

## Monitoring in LangSmith

Open the project set in `LANGSMITH_PROJECT`:

- Each message creates a `skin-guide-chat` trace, with the OpenAI call nested inside it. The trace includes the prompt, the structured reply, token usage, latency and any errors.
- To see a whole conversation, filter by metadata `session_id`. The chat starts a new session ID whenever someone clicks "New chat".
- Feedback scores (`helpful`, 1 or 0) are attached to the trace they belong to. You can use them to filter, chart and build datasets.
