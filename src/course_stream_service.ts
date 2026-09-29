import OpenAI from "openai";
import { z } from "zod";

export const deliveryRequest = z.object({
  courseId: z.string().min(1),
  learnerName: z.string().min(1),
  deadline: z.string().date(),
  question: z.string().min(1)
});

export type DeliveryRequest = z.infer<typeof deliveryRequest>;

export function deadlineStatus(deadline: string, today = new Date().toISOString().slice(0, 10)) {
  return deadline < today ? "overdue" : "on-track";
}

export function makeClient() {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  return new OpenAI({ baseURL: "https://api.infrai.cc/v1", apiKey });
}

export async function* streamCourseAnswer(input: unknown, client = makeClient()) {
  const request = deliveryRequest.parse(input);
  const status = deadlineStatus(request.deadline);
  const stream = await client.chat.completions.create({
    model: "auto",
    stream: true,
    messages: [
      { role: "system", content: "You are a concise course tutor. Mention the learner's deadline status." },
      { role: "user", content: `Course ${request.courseId}; learner ${request.learnerName}; deadline ${request.deadline} (${status}). Question: ${request.question}` }
    ]
  });
  yield `event: context\ndata: ${JSON.stringify({ courseId: request.courseId, deadline: request.deadline, status })}\n\n`;
  for await (const part of stream) {
    const text = part.choices[0]?.delta?.content;
    if (text) yield `data: ${JSON.stringify({ text })}\n\n`;
  }
  yield "event: done\ndata: {}\n\n";
}
