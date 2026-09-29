import { createServer } from "node:http";
import { streamCourseAnswer } from "./course_stream_service.ts";

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/course/stream") {
    res.writeHead(404).end();
    return;
  }
  let body = "";
  for await (const chunk of req) body += chunk;
  try {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache" });
    for await (const event of streamCourseAnswer(JSON.parse(body))) res.write(event);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid request";
    if (!res.headersSent) res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
});

server.listen(3000, () => console.log("course stream listening on http://localhost:3000"));
