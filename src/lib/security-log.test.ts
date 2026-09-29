import { describe, expect, it, vi, afterEach } from "vitest";
import { logSecurityEvent } from "@/lib/security-log";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("logSecurityEvent", () => {
  it("emits one JSON line with actor/action/entity/ip/result", () => {
    const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    logSecurityEvent({
      action: "purge:project",
      actorId: "u1",
      entityId: "e1",
      ip: "203.0.113.7",
      ok: true,
    });
    expect(write).toHaveBeenCalledTimes(1);
    const line = String(write.mock.calls[0][0]);
    expect(line.endsWith("\n")).toBe(true);
    const payload = JSON.parse(line);
    expect(payload).toMatchObject({
      actor: "u1",
      action: "purge:project",
      entity: "e1",
      ip: "203.0.113.7",
      result: "ok",
    });
    expect(typeof payload.ts).toBe("string");
  });

  it("defaults actor/ip and never throws", () => {
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => {
      throw new Error("drain down");
    });
    expect(() =>
      logSecurityEvent({ action: "admin.auth", ok: false }),
    ).not.toThrow();
    expect(write).toHaveBeenCalledTimes(1);
  });
});
