import { act, renderHook } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { useEntityId } from "./use-entity-id";

const STORAGE_SAFE = /^[a-zA-Z0-9._-]+$/;

function Probe() {
  return <span id="probe">{useEntityId(undefined)}</span>;
}

describe("useEntityId", () => {
  it("returns the persisted id when one exists", () => {
    const { result } = renderHook(() => useEntityId("clx123abc"));

    expect(result.current).toBe("clx123abc");
  });

  it("falls back to a temp id in create mode", () => {
    const { result } = renderHook(() => useEntityId(undefined));

    expect(result.current).toMatch(/^temp-/);
  });

  it("keeps the same id across re-renders", () => {
    const { result, rerender } = renderHook(() => useEntityId(undefined));
    const first = result.current;
    rerender();
    rerender();

    expect(result.current).toBe(first);
  });

  it("produces an id that is safe inside a storage path", () => {
    const { result } = renderHook(() => useEntityId(undefined));

    // generateImagePath interpolates the id into `entityType/<id>/<file>`
    // without escaping, so anything React's useId emits (: or guillemets)
    // would leak into the Supabase object key.
    expect(result.current).toMatch(STORAGE_SAFE);
  });

  it("gives two mounted forms different ids", () => {
    const a = renderHook(() => useEntityId(undefined));
    const b = renderHook(() => useEntityId(undefined));

    expect(a.result.current).not.toBe(b.result.current);
  });

  it("does not change the id once a real id arrives", () => {
    const { result, rerender } = renderHook(
      ({ id }: { id?: string }) => useEntityId(id),
      { initialProps: { id: undefined as string | undefined } },
    );
    const temp = result.current;
    act(() => rerender({ id: "clx999" }));

    expect(temp).toMatch(/^temp-/);
    expect(result.current).toBe("clx999");
  });
});

describe("useEntityId across a server/client boundary", () => {
  it("hydrates without a mismatch", async () => {
    const serverHtml = renderToString(<Probe />);

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await act(async () => {
      hydrateRoot(container, <Probe />);
    });

    const hydrationErrors = error.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.includes("hydrat"));

    expect(hydrationErrors).toEqual([]);
    expect(container.textContent).toBe(serverHtml.replace(/<[^>]+>/g, ""));

    error.mockRestore();
    container.remove();
  });
});
