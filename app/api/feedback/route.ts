import { z } from "zod";
import { getDefaultProjectName } from "langsmith";
import { langsmith } from "@/lib/ai";

const FeedbackRequest = z.object({
  runId: z.uuid(),
  startTime: z.number().optional(),
  score: z.union([z.literal(0), z.literal(1)]),
  comment: z.string().max(1000).optional(),
});

let projectId: Promise<string> | undefined;

function getProjectId() {
  projectId ??= langsmith
    .readProject({ projectName: getDefaultProjectName() })
    .then((p) => p.id)
    .catch((err) => {
      projectId = undefined;
      throw err;
    });
  return projectId;
}

export async function POST(request: Request) {
  const body = FeedbackRequest.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  const { runId, startTime, score, comment } = body.data;

  try {
    await langsmith.createFeedback({
      runId,
      sessionId: await getProjectId(),
      key: "helpful",
      score,
      comment,
      startTime,
      feedbackSourceType: "app",
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/feedback]", err);
    return Response.json({ error: "Could not save feedback" }, { status: 500 });
  }
}
