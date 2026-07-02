import assert from "node:assert/strict";
import test from "node:test";

import {
  assertIdeaContextWithinLimit,
  createIdeaThreadSchema,
  ideaContextMaxLength,
  ideaMessagesContext,
  normalizeIdeaThreadTitle,
  parseCreateIdeaThreadInput,
  parseSendIdeaMessageInput,
  sendIdeaMessageSchema,
  titleFromMessage
} from "../domain/idea-chat";

test("idea thread title defaults when omitted", () => {
  assert.equal(normalizeIdeaThreadTitle(null), "Untitled idea thread");
});

test("idea thread input treats blank optional titles as omitted", () => {
  assert.deepEqual(parseCreateIdeaThreadInput({ title: "   " }), { title: null });
});

test("idea thread input rejects unknown fields", () => {
  assert.throws(
    () =>
      createIdeaThreadSchema.parse({
        provider: "provider-specific",
        title: "Opening scene"
      }),
    /Unrecognized key/
  );
});

test("idea message input rejects empty messages", () => {
  assert.throws(
    () =>
      sendIdeaMessageSchema.parse({
        content: ""
      }),
    /Message is required/
  );
});

test("idea message input rejects provider-specific fields", () => {
  assert.throws(
    () =>
      sendIdeaMessageSchema.parse({
        content: "Help me plan a rival character.",
        model: "provider-specific"
      }),
    /Unrecognized key/
  );
});

test("idea message input trims valid content", () => {
  const parsed = parseSendIdeaMessageInput({
    content: "  A quiet village with a hidden machine shrine  "
  });

  assert.equal(parsed.content, "A quiet village with a hidden machine shrine");
});

test("idea thread title can be derived from a first message", () => {
  assert.equal(titleFromMessage("A hero discovers a dragon under the subway."), "A hero discovers a dragon under the subway.");
});

test("idea context includes only completed recent messages", () => {
  const messages = ideaMessagesContext([
    {
      aiJobId: null,
      content: "Draft a premise.",
      createdAt: new Date(),
      error: null,
      id: "msg_1",
      metadata: {},
      role: "user",
      status: "completed",
      threadId: "thread_1",
      updatedAt: new Date()
    },
    {
      aiJobId: null,
      content: "Provider failed.",
      createdAt: new Date(),
      error: "Provider failed.",
      id: "msg_2",
      metadata: {},
      role: "assistant",
      status: "failed",
      threadId: "thread_1",
      updatedAt: new Date()
    }
  ]);

  assert.deepEqual(messages, [{ content: "Draft a premise.", role: "user" }]);
});

test("idea context guard rejects oversized context", () => {
  assert.throws(
    () =>
      assertIdeaContextWithinLimit({
        content: "x".repeat(ideaContextMaxLength + 1)
      }),
    /Idea context is too large/
  );
});
