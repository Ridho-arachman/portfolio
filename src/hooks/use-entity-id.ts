"use client";

import { useId } from "react";

/**
 * DOM id for an ImageUpload, stable across server render and hydration.
 *
 * Date.now()/Math.random() cannot be used here: they differ between the server
 * pass and the client pass, so the label's htmlFor and the input's id diverge
 * and React reports a hydration mismatch. useId is React's hydration-safe id.
 *
 * The value is also interpolated into a Supabase storage key by
 * generateImagePath without escaping, so the characters React emits (`:` in
 * React 18, guillemets in React 19) are stripped.
 */
export function useEntityId(existingId?: string): string {
  const reactId = useId();
  if (existingId) return existingId;
  return `temp-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
}
