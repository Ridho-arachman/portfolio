"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Send, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { DEFAULT_LOCALE, getLocaleFromPath, isValidLocale, type Locale } from "@/lib/i18n";

export type PortoBotVariant = "panel" | "page";

export type PortoBotReply = {
  answer: string;
  links?: { label: string; href: string }[];
  suggestions?: string[];
};

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
  links?: PortoBotReply["links"];
};

/**
 * Copy UI yang tidak pernah datang dari API. Enam string per locale; intro,
 * isi jawaban, dan saran chip semuanya milik /api/faq supaya teks itu bisa
 * diganti dari admin lewat tabel translation.
 */
const UI: Record<
  Locale,
  {
    log: string;
    placeholder: string;
    send: string;
    close: string;
    thinking: string;
    fallback: string;
  }
> = {
  en: {
    log: "PortoBot conversation",
    placeholder: "Ask about projects, skills, experience…",
    send: "Send message",
    close: "Close PortoBot",
    thinking: "PortoBot is typing",
    fallback: "Something went wrong. Please try again.",
  },
  id: {
    log: "Percakapan PortoBot",
    placeholder: "Tanya soal project, skill, pengalaman…",
    send: "Kirim pesan",
    close: "Tutup PortoBot",
    thinking: "PortoBot sedang mengetik",
    fallback: "Terjadi kesalahan. Silakan coba lagi.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isLink(value: unknown): value is { label: string; href: string } {
  return isRecord(value) && isNonEmptyString(value.label) && isNonEmptyString(value.href);
}

/**
 * Bentuk respons API tidak dipercaya: cek setiap field, karena satu payload
 * rusak tidak boleh membuat layar kosong tanpa penjelasan.
 */
function parseReply(payload: unknown): {
  body: string | null;
  links: { label: string; href: string }[];
  suggestions: string[];
} {
  if (!isRecord(payload)) return { body: null, links: [], suggestions: [] };

  const body = isNonEmptyString(payload.answer)
    ? payload.answer
    : isNonEmptyString(payload.intro)
      ? payload.intro
      : null;

  return {
    body,
    links: Array.isArray(payload.links) ? payload.links.filter(isLink).slice(0, 4) : [],
    suggestions: Array.isArray(payload.suggestions)
      ? payload.suggestions.filter(isNonEmptyString).slice(0, 4)
      : [],
  };
}

export function PortoBot({
  variant,
  open = true,
  onClose,
}: {
  variant: PortoBotVariant;
  open?: boolean;
  onClose?: () => void;
}): JSX.Element {
  const prefersReducedMotion = useReducedMotion();

  // `lang` dari segment URL, bukan useParams: komponen ini dirender dari root
  // layout (yang tidak punya params) maupun dari halaman /faq.
  const pathLocale = getLocaleFromPath(usePathname());
  const locale: Locale = pathLocale && isValidLocale(pathLocale) ? pathLocale : DEFAULT_LOCALE;
  const ui = UI[locale];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const requestId = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = useCallback(
    async (question: string) => {
      const text = question.trim();
      if (pendingRef.current) return;

      pendingRef.current = true;
      setPending(true);
      const id = ++requestId.current;

      // Optimis: pesan user langsung tampil sebelum jaringan menjawab.
      if (text) setMessages((prev) => [...prev, { id, role: "user", text }]);
      setDraft("");

      try {
        const response = await fetch("/api/faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: text, locale }),
        });
        // Balasan yang tertinggal setelah permintaan lebih baru diabaikan,
        // supaya transkrip tidak pernah menampilkan jawaban yang salah.
        if (id !== requestId.current) return;
        if (!response.ok) throw new Error(`faq ${response.status}`);

        const parsed = parseReply(await response.json());
        const body = parsed.body;
        if (!body) throw new Error("empty answer");

        setMessages((prev) => [...prev, { id, role: "bot", text: body, links: parsed.links }]);
        setSuggestions(parsed.suggestions);
      } catch {
        if (id !== requestId.current) return;
        setMessages((prev) => [...prev, { id, role: "bot", text: ui.fallback }]);
        setSuggestions([]);
      } finally {
        if (id === requestId.current) {
          pendingRef.current = false;
          setPending(false);
        }
      }
    },
    [locale, ui.fallback],
  );

  // Sapaan pembuka: pertanyaan kosong, API yang membalas intro + saran.
  useEffect(() => {
    void send("");
  }, [send]);

  useEffect(() => {
    if (variant !== "panel" || !open || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [variant, open, onClose]);

  useEffect(() => {
    if (variant === "panel" && open) inputRef.current?.focus();
  }, [variant, open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending]);

  const isPanel = variant === "panel";

  return (
    <motion.div
      role={isPanel ? "dialog" : undefined}
      aria-modal={isPanel ? true : undefined}
      aria-label={isPanel ? "PortoBot" : undefined}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
      transition={
        prefersReducedMotion ? undefined : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }
      }
      className={
        isPanel
          ? // `fixed` + host: panel berdiri sendiri di atas pill, tidak butuh
            // konteks posisi dari induknya.
            "fixed right-6 bottom-[4.5rem] z-10 flex w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-bg-secondary/90 shadow-2xl backdrop-blur-md h-[min(32rem,70dvh)]"
          : "glass-strong flex h-[min(36rem,75dvh)] w-full flex-col overflow-hidden rounded-2xl shadow-2xl"
      }
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-text-primary">PortoBot</h2>
        {isPanel && onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="flex h-11 w-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-glass-hover focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label={ui.log}
        className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col gap-2">
            <div
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-3 py-2 text-sm text-white"
                  : "max-w-[92%] rounded-2xl rounded-bl-sm border border-white/10 bg-bg-tertiary px-3 py-2 text-sm text-text-primary"
              }
            >
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
              {message.links?.length ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {message.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="inline-flex min-h-11 items-center rounded-full border border-accent/30 bg-accent-muted/50 px-3 py-2 text-xs text-accent transition-colors hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ))}

        {pending ? (
          <div className="flex items-center gap-1.5" aria-label={ui.thinking}>
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-muted"
                style={{ animationDelay: `${dot * 120}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {suggestions.length ? (
        <div className="flex flex-wrap gap-2 px-3 pb-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void send(suggestion)}
              disabled={pending}
              className="min-h-11 rounded-full border border-accent/30 bg-accent-muted/50 px-3 py-2 text-left text-xs text-accent transition-colors hover:bg-accent/15 focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={ui.placeholder}
          aria-label={ui.placeholder}
          maxLength={280}
          className="min-h-11 flex-1 rounded-full border border-white/10 bg-bg-primary/60 px-4 py-2 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <button
          type="submit"
          aria-label={ui.send}
          aria-busy={pending}
          disabled={pending || draft.trim().length === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </motion.div>
  );
}
