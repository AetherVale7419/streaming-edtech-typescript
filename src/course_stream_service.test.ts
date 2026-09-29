import assert from "node:assert/strict";
import { deadlineStatus, deliveryRequest } from "./course_stream_service.ts";

assert.equal(deadlineStatus("2026-09-09", "2026-09-10"), "overdue");
assert.equal(deadlineStatus("2026-09-10", "2026-09-10"), "on-track");
assert.equal(deliveryRequest.parse({ courseId: "algebra", learnerName: "Mina", deadline: "2026-09-10", question: "How?" }).courseId, "algebra");
console.log("deadline decision test passed");
