// Server-only audit trail: 1 baris JSON per peristiwa ke stdout (Vercel log drain).
// Tanpa nilai secret/PII berlebih — hanya id, bukan password/token/body.
export function logSecurityEvent(input: {
  action: string;
  actorId?: string;
  entityId?: string;
  ip?: string;
  ok: boolean;
}): void {
  try {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      actor: input.actorId ?? "anon",
      action: input.action,
      entity: input.entityId ?? null,
      ip: input.ip ?? "unknown",
      result: input.ok ? "ok" : "fail",
    });
    process.stdout.write(`${line}\n`);
  } catch {
    // Log tak boleh melempar — kegagalan audit tak boleh menggagalkan request.
  }
}
