"use client";

import {
  Archive,
  ArchiveRestore,
  CheckCheck,
  Inbox,
  Mail,
  MailCheck,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  useAdminMessages,
  useUpdateMessageStatus,
  useDeleteMessage,
} from "@/hooks/use-messages";
import {
  ADMIN_MESSAGES,
  MESSAGE_STATUSES,
  MESSAGE_STATUS_META,
  type AdminMessage,
  type MessageStatus,
} from "./constants";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type TabFilter = "ALL" | MessageStatus;

export function MessagesInbox() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabFilter>("ALL");
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAllRead, setConfirmAllRead] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data, isLoading, isError, refetch } = useAdminMessages<AdminMessage>();
  const updateStatusMutation = useUpdateMessageStatus();
  const deleteMutation = useDeleteMessage();

  const messages = data?.data ?? [];

  const counts = useMemo(() => {
    const total = messages.length;
    const byStatus = MESSAGE_STATUSES.reduce(
      (acc, status) => {
        acc[status] = messages.filter((m) => m.status === status).length;
        return acc;
      },
      {} as Record<MessageStatus, number>,
    );
    return { total, byStatus };
  }, [messages]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = messages
      .filter((message) => (tab === "ALL" ? true : message.status === tab))
      .filter((message) =>
        q
          ? message.name.toLowerCase().includes(q) ||
            message.email.toLowerCase().includes(q) ||
            message.subject.toLowerCase().includes(q) ||
            message.content.toLowerCase().includes(q)
          : true,
      );
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [messages, tab, query]);

  const handleDelete = (id: string) => {
    if (confirmId === id) {
      deleteMutation.mutate(id);
      setConfirmId(null);
      if (expandedId === id) setExpandedId(null);
    } else {
      setConfirmId(id);
    }
  };

  const handleMarkAllRead = () => {
    if (confirmAllRead) {
      const unreadIds = messages
        .filter((m) => m.status === "NEW")
        .map((m) => m.id);
      for (const id of unreadIds) {
        updateStatusMutation.mutate({ id, status: "READ" });
      }
      setConfirmAllRead(false);
    } else {
      setConfirmAllRead(true);
    }
  };

  const showUnread = messages.some((m) => m.status === "NEW");

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Inbox className="h-5 w-5" />
              {showUnread && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-bg-primary">
                  {counts.byStatus.NEW}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {ADMIN_MESSAGES.title}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_MESSAGES.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={!showUnread}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs transition-colors",
                confirmAllRead
                  ? "border-accent/60 bg-accent/15 text-accent"
                  : "border-glass-border bg-glass-bg text-text-secondary hover:border-accent/40 hover:text-accent",
                !showUnread && "cursor-not-allowed opacity-40 hover:border-glass-border hover:text-text-secondary",
              )}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {confirmAllRead
                ? ADMIN_MESSAGES.markAllReadConfirmLabel
                : ADMIN_MESSAGES.markAllReadLabel}
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
          <div className="border-b border-glass-border p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={ADMIN_MESSAGES.searchPlaceholder}
                  className="w-full rounded-xl border border-glass-border bg-bg-primary/60 py-2.5 pl-10 pr-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTab("ALL")}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    tab === "ALL"
                      ? "bg-accent text-bg-primary"
                      : "border border-glass-border bg-glass-bg text-text-secondary hover:text-accent",
                  )}
                >
                  {ADMIN_MESSAGES.allLabel} ({counts.total})
                </button>
                {MESSAGE_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setTab(status)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      tab === status
                        ? "bg-accent text-bg-primary"
                        : "border border-glass-border bg-glass-bg text-text-secondary hover:text-accent",
                    )}
                  >
                    {MESSAGE_STATUS_META[status].label} ({counts.byStatus[status]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!mounted || isLoading ? (
            <div className="space-y-4 p-4 sm:p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{ADMIN_MESSAGES.errorTitle}</h3>
              <p className="mt-1 text-sm text-text-secondary">
                {ADMIN_MESSAGES.errorNote}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                {ADMIN_MESSAGES.retryLabel}
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">
                {tab === "ALL" && query.trim() === ""
                  ? ADMIN_MESSAGES.emptyInboxTitle
                  : ADMIN_MESSAGES.emptyTitle}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {tab === "ALL" && query.trim() === ""
                  ? ADMIN_MESSAGES.emptyInboxNote
                  : ADMIN_MESSAGES.emptyNote}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-glass-border/60">
              {filtered.map((message) => {
                const isExpanded = expandedId === message.id;
                const isUnread = message.status === "NEW";
                return (
                  <li key={message.id}>
                    <div
                      className={cn(
                        "flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-white/5 sm:px-5",
                        isExpanded && "bg-white/5",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : message.id)
                        }
                        className="flex min-w-0 flex-1 items-start gap-3 text-left"
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                            isUnread
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-glass-border bg-white/5 text-text-secondary",
                          )}
                        >
                          {initials(message.name)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "truncate text-sm",
                                isUnread ? "font-semibold" : "font-medium",
                              )}
                            >
                              {message.name}
                            </span>
                            <span
                              className={cn(
                                "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                                MESSAGE_STATUS_META[message.status].badgeClass,
                              )}
                            >
                              {MESSAGE_STATUS_META[message.status].label}
                            </span>
                            <span className="ml-auto shrink-0 text-[10px] text-text-muted">
                              {formatDate(message.createdAt)}
                            </span>
                          </span>

                          <span className="mt-0.5 block truncate text-xs font-medium text-text-primary">
                            {message.subject}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-text-muted">
                            {message.email} · {message.content}
                          </span>
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {message.status === "NEW" && (
                          <button
                            type="button"
                            title={ADMIN_MESSAGES.markReadLabel}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: message.id,
                                status: "READ",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <MailCheck className="h-3 w-3" />
                            {ADMIN_MESSAGES.markReadLabel}
                          </button>
                        )}
                        {message.status === "ARCHIVED" && (
                          <button
                            type="button"
                            title={ADMIN_MESSAGES.unarchiveLabel}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: message.id,
                                status: "READ",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            <ArchiveRestore className="h-3 w-3" />
                            {ADMIN_MESSAGES.unarchiveLabel}
                          </button>
                        )}
                        {message.status !== "REPLIED" &&
                          message.status !== "ARCHIVED" && (
                            <button
                              type="button"
                              title={ADMIN_MESSAGES.markRepliedLabel}
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: message.id,
                                  status: "REPLIED",
                                })
                              }
                              className="hidden items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-emerald-500/40 hover:text-emerald-400 md:inline-flex"
                            >
                              <MailCheck className="h-3 w-3" />
                              {ADMIN_MESSAGES.markRepliedLabel}
                            </button>
                          )}
                        {message.status !== "ARCHIVED" && (
                          <button
                            type="button"
                            title={ADMIN_MESSAGES.archiveLabel}
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: message.id,
                                status: "ARCHIVED",
                              })
                            }
                            className="hidden items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg px-2.5 py-1.5 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent sm:inline-flex"
                          >
                            <Archive className="h-3 w-3" />
                            {ADMIN_MESSAGES.archiveLabel}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(message.id)}
                          onBlur={() => setConfirmId(null)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors",
                            confirmId === message.id
                              ? "border-destructive/60 bg-destructive/15 text-destructive"
                              : "border-glass-border bg-glass-bg text-text-secondary hover:border-destructive/50 hover:text-destructive",
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                          {confirmId === message.id
                            ? ADMIN_MESSAGES.deleteConfirmLabel
                            : ADMIN_MESSAGES.deleteLabel}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-glass-border/60 bg-bg-primary/40 px-4 py-4 sm:px-5">
                        <div className="max-w-3xl">
                          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" />
                              {message.email}
                            </span>
                            <span>Received {formatDate(message.createdAt)}</span>
                          </div>
                          <h3 className="mb-2 text-sm font-semibold text-text-primary">
                            {message.subject}
                          </h3>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
