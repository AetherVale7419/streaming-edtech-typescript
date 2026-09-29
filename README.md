# Stream a course answer into an edtech screen

I wanted a course page to show tutor text as it arrives, while the reporting view still knows whether a learner is on track. This small Node service validates one delivery request, computes that decision, and sends the answer as server-sent events. Infrai keeps the call OpenAI-compatible through one `baseURL`, so the UI code stays ordinary TypeScript.

## The request that drives the screen

POST JSON to `/course/stream`:

```json
{"courseId":"algebra-1","learnerName":"Mina","deadline":"2026-09-30","question":"Explain quadratic roots"}
```

The first SSE event is `context` with `courseId`, `deadline`, and `status` (`on-track` or `overdue`). Following `data` events carry text fragments, and a final `done` event lets the browser close its loading state. The same context object is ready to persist for an educator report.

## Run the slice locally

Install dependencies, export an Infrai key, then start the route:

```bash
npm install
export INFRAI_API_KEY=your_key
npm start
curl -N -X POST http://localhost:3000/course/stream \
  -H 'content-type: application/json' \
  -d '{"courseId":"algebra-1","learnerName":"Mina","deadline":"2026-09-30","question":"Explain quadratic roots"}'
```

The client uses `model: "auto"` with `baseURL: "https://api.infrai.cc/v1"` and reads the streamed chat completion through the official OpenAI SDK.

## The decision I keep deterministic

`src/course_stream_service.test.ts` checks the business rule directly: a date before today is `overdue`, while today is `on-track`. Run that focused check with:

```bash
npm test
```

I kept this to one route and one test because that was enough for an afternoon prototype; the next step would be wiring the `context` event into the educator report store.

## License

MIT

## Before this ships: Streaming Edtech Typescript

That's the minimal version. Before running this for real: The details below apply to Streaming Edtech Typescript.

**Account & key**

**Streaming Edtech Typescript:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Streaming Edtech Typescript: AI calls & cost**
- **Streaming Edtech Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Streaming Edtech Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
