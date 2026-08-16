import { beforeEach, describe, expect, it } from "vitest";
import { useMessageStore } from "./message-store";
import { SEED_MESSAGES } from "./constants";

const newMessage = {
  name: "Tester",
  email: "tester@example.com",
  subject: "Test Message",
  content: "A message created during a unit test.",
};

describe("message store", () => {
  beforeEach(() => {
    localStorage.clear();
    useMessageStore.setState({ messages: SEED_MESSAGES });
  });

  it("seeds messages from constants", () => {
    expect(useMessageStore.getState().messages).toHaveLength(
      SEED_MESSAGES.length,
    );
  });

  it("adds a message as NEW at the front", () => {
    useMessageStore.getState().addMessage(newMessage);

    const first = useMessageStore.getState().messages[0];
    expect(first.name).toBe(newMessage.name);
    expect(first.status).toBe("NEW");
    expect(first.id).toBeTruthy();
    expect(useMessageStore.getState().messages).toHaveLength(
      SEED_MESSAGES.length + 1,
    );
  });

  it("sets a message status", () => {
    const id = useMessageStore.getState().messages[0].id;
    useMessageStore.getState().setStatus(id, "REPLIED");

    expect(
      useMessageStore.getState().messages.find((m) => m.id === id)?.status,
    ).toBe("REPLIED");
  });

  it("marks all readable messages as READ", () => {
    useMessageStore.getState().markAllRead();

    for (const message of useMessageStore.getState().messages) {
      expect(["READ", "ARCHIVED", "REPLIED"]).toContain(message.status);
      expect(message.status).not.toBe("NEW");
    }
  });

  it("deletes a message", () => {
    const id = useMessageStore.getState().messages[0].id;
    useMessageStore.getState().deleteMessage(id);

    expect(
      useMessageStore.getState().messages.find((m) => m.id === id),
    ).toBeUndefined();
  });

  it("resets to the seed list", () => {
    useMessageStore.getState().addMessage(newMessage);
    useMessageStore.getState().reset();

    expect(useMessageStore.getState().messages).toHaveLength(
      SEED_MESSAGES.length,
    );
  });
});
