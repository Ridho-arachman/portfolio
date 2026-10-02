/**
 * Machine translation EN -> ID at admin-save time (MyMemory free API, no key).
 *
 * Design notes:
 * - One sequential HTTP call per element: keeps URLs short (MyMemory has a
 *   query-length limit) and volume per save is only a few fields.
 * - Per-element try/catch: a failed element resolves to "" and the caller
 *   treats it as blank (resolver inherits the English base), so a translator
 *   outage degrades to untranslated content instead of failing the save.
 * - Native fetch only, no new dependencies.
 *
 * Mocking choice: `translateTexts` takes an optional `fetchImpl` (defaults to
 * global fetch), so unit tests inject a fake directly. Route tests that want
 * to stub the whole module can still `vi.mock("@/lib/translate")`.
 */

export type TranslateTarget = "id";

export type TranslateFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";
const FETCH_TIMEOUT_MS = 8000;

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
  responseStatus?: number | string;
}

async function translateOne(
  text: string,
  target: TranslateTarget,
  fetchImpl: TranslateFetch,
): Promise<string> {
  if (text.trim().length === 0) return "";
  const url =
    `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}` +
    `&langpair=${encodeURIComponent(`en|${target}`)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    if (!res.ok) return "";
    const json = (await res.json()) as MyMemoryResponse;
    // MyMemory answers HTTP 200 even on errors (429 quota, 403, length
    // limits) and reports them via responseStatus — only "200" is usable.
    if (String(json.responseStatus) !== "200") return "";
    const out = json.responseData?.translatedText?.trim() ?? "";
    return out.length > 0 ? out : "";
  } catch {
    // Offline, timeout, abort, bad JSON: degrade to blank, never throw.
    return "";
  } finally {
    clearTimeout(timer);
  }
}

export async function translateTexts(
  texts: string[],
  target: TranslateTarget,
  fetchImpl: TranslateFetch = fetch,
): Promise<string[]> {
  const out: string[] = [];
  for (const text of texts) {
    out.push(await translateOne(text, target, fetchImpl));
  }
  return out;
}
