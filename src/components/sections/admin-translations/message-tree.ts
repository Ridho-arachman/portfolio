// Turunkan daftar leaf dari dokumen efektif `Messages` untuk Needs UI editor.
//
// Aturan "patchable" sengaja diturunkan di sini, terpisah dari schema zod di
// `@/lib/translations`: schema itu hanya bisa di-import sebagai tipe di client
// (modulnya instantiate PrismaClient di level modul), sementara editor tetap
// perlu tahu key mana yang boleh diedit. Aturannya sama persis dengan yang
// di-encode `shapeFromJson`: hanya leaf bertipe string yang bisa ditimpa;
// leaf non-string seperti `hero.typewriter` menjadi `z.never()` di server.

export interface EditableField {
  /** Path datar, persis seperti yang diterima API: "skills.categories.DEVOPS_TOOLS". */
  path: string;
  inherited: string;
}

export interface SkippedField {
  path: string;
  /** Nama tipe JS, untuk menjelaskan kenapa key ini tidak bisa diedit. */
  kind: string;
}

export interface MessageGroup {
  namespace: string;
  fields: EditableField[];
  skipped: SkippedField[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function walk(
  node: Record<string, unknown>,
  prefix: string,
  fields: EditableField[],
  skipped: SkippedField[],
) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      walk(value, path, fields, skipped);
    } else if (typeof value === "string") {
      fields.push({ path, inherited: value });
    } else {
      skipped.push({ path, kind: Array.isArray(value) ? "array" : typeof value });
    }
  }
}

/** Kelompokkan dokumen menjadi namespace level atas, urutan dokumen dipertahankan. */
export function groupMessages(messages: unknown): MessageGroup[] {
  if (!isPlainObject(messages)) return [];

  const groups: MessageGroup[] = [];

  for (const [namespace, node] of Object.entries(messages)) {
    const fields: EditableField[] = [];
    const skipped: SkippedField[] = [];

    if (isPlainObject(node)) walk(node, namespace, fields, skipped);
    else skipped.push({ path: namespace, kind: Array.isArray(node) ? "array" : typeof node });

    groups.push({ namespace, fields, skipped });
  }

  return groups;
}

/**
 * Saring by path dan by nilai yang sedang TAMPIL. `draft` berisi key yang akan
 * dipersist; nilainya lebih baru dari dokumen, jadi harus menang atas `inherited`
 * supaya admin bisa mencari teks yang baru saja diketik.
 */
export function filterGroups(
  groups: MessageGroup[],
  query: string,
  draft: Record<string, string>,
): MessageGroup[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return groups;

  const matches = (path: string, value: string) =>
    path.toLowerCase().includes(needle) || value.toLowerCase().includes(needle);

  return groups
    .map((group) => ({
      namespace: group.namespace,
      fields: group.fields.filter((field) =>
        matches(field.path, draft[field.path] ?? field.inherited),
      ),
      skipped: group.skipped.filter((item) => matches(item.path, item.path)),
    }))
    .filter((group) => group.fields.length > 0 || group.skipped.length > 0);
}
