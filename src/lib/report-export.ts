import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Pure transform + download utils (client-side). Tidak fetch data — terima
// SystemReport yang sudah diambil dari GET /api/admin/report.
export interface SystemReport {
  meta: { from: string | null; to: string | null };
  counts: {
    projects: number;
    certificates: number;
    experiences: number;
    messages: number;
    unreadMessages: number;
  };
  visits: {
    totalFiltered: number;
    totalAllTime: number;
    daily: { date: string; visits: number }[];
    topCountries: { countryCode: string; country: string; visits: number }[];
    topCities: { city: string; country: string; visits: number }[];
  };
  recent: {
    projects: { id: string; title: string; createdAt: string }[];
    certificates: { id: string; title: string; createdAt: string }[];
    experiences: { id: string; title: string; createdAt: string }[];
    messages: { id: string; name: string; createdAt: string }[];
  };
}

// --- Legacy generic payload (dipakai admin-dashboard.tsx) -------------------
// Dipertahankan agar UI dashboard agen paralel tidak pecah; export 2-arg
// tetap CSV-kompatibel-Excel / print-window seperti semula.

export type ReportValue = string | number | boolean | null | undefined;

export interface ReportTable {
  title: string;
  headers: string[];
  rows: ReportValue[][];
}

export interface ReportPayload {
  title: string;
  period: string;
  tables: ReportTable[];
  generatedAt: string;
}

function cell(v: ReportValue): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function toCsvCell(v: ReportValue): string {
  const s = cell(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Normalize an unknown /api/admin/report payload into tables. */
export function normalizeReport(data: unknown, period: string): ReportPayload {
  const root =
    data !== null &&
    typeof data === "object" &&
    "data" in (data as Record<string, unknown>) &&
    (data as Record<string, unknown>).data !== undefined
      ? (data as Record<string, unknown>).data
      : data;
  const obj =
    root !== null && typeof root === "object"
      ? (root as Record<string, unknown>)
      : {};
  const tables: ReportTable[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length > 0) {
      if (
        value.every(
          (item): item is Record<string, unknown> =>
            item !== null && typeof item === "object",
        )
      ) {
        const headers = Array.from(
          new Set(value.flatMap((item) => Object.keys(item))),
        ).filter((h) => {
          const sample = value
            .map((item) => item[h])
            .find((v) => v !== null && v !== undefined);
          return (
            sample === undefined ||
            ["string", "number", "boolean"].includes(typeof sample)
          );
        });
        if (headers.length > 0) {
          tables.push({
            title: key,
            headers,
            rows: value.map(
              (item): ReportValue[] =>
                headers.map((h): ReportValue => {
                  const v: unknown = item[h];
                  return typeof v === "string" ||
                    typeof v === "number" ||
                    typeof v === "boolean"
                    ? v
                    : null;
                }),
            ),
          });
          continue;
        }
      }
      tables.push({
        title: key,
        headers: ["value"],
        rows: value.map((item) => [
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
            ? item
            : JSON.stringify(item),
        ]),
      });
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const summary = tables.find((t) => t.title === "summary");
      const row: ReportValue[] = [key, value];
      if (summary) summary.rows.push(row);
      else
        tables.unshift({
          title: "summary",
          headers: ["metric", "value"],
          rows: [row],
        });
    }
  }

  return {
    title: "Admin Report",
    period: period || "All time",
    tables,
    generatedAt: new Date().toISOString(),
  };
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function stamp(d = new Date()): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

function dayCompact(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function reportPeriodLabel(report: SystemReport): string {
  const { from, to } = report.meta;
  if (!from && !to) return "semua-waktu";
  return `${from ? dayCompact(from) : "awal"}_${to ? dayCompact(to) : "akhir"}`;
}

export function reportPeriodTitle(report: SystemReport): string {
  const { from, to } = report.meta;
  if (!from && !to) return "Semua waktu";
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("id-ID");
  return `${from ? fmt(from) : "awal"} – ${to ? fmt(to) : "akhir"}`;
}

function reportFilename(report: SystemReport, ext: "xlsx" | "pdf"): string {
  return `laporan-sistem-${reportPeriodLabel(report)}-${stamp()}.${ext}`;
}

/** Excel-compatible CSV export (BOM so Excel reads UTF-8). */
function xlsxLegacyCsv(payload: ReportPayload, filename: string): void {
  const lines: string[] = [
    toCsvCell(payload.title),
    toCsvCell(`Period: ${payload.period}`),
    toCsvCell(`Generated: ${payload.generatedAt}`),
    "",
  ];
  for (const table of payload.tables) {
    lines.push(toCsvCell(table.title));
    lines.push(table.headers.map(toCsvCell).join(","));
    for (const row of table.rows) {
      lines.push(row.map(toCsvCell).join(","));
    }
    lines.push("");
  }
  download(
    new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    }),
    filename.endsWith(".csv") ? filename : `${filename}.csv`,
  );
}

export function generateReportXlsx(report: SystemReport): void;
export function generateReportXlsx(
  payload: ReportPayload,
  filename: string,
): void;
export function generateReportXlsx(
  input: SystemReport | ReportPayload,
  filename?: string,
): void {
  if (typeof filename === "string") {
    xlsxLegacyCsv(input as ReportPayload, filename);
    return;
  }
  const report = input as SystemReport;
  const period = reportPeriodTitle(report);
  const workbook = XLSX.utils.book_new();

  const summaryAoa: (string | number)[][] = [
    ["Laporan Sistem", period],
    [],
    ["Metrik", "Jumlah"],
    ["Proyek", report.counts.projects],
    ["Sertifikat", report.counts.certificates],
    ["Pengalaman", report.counts.experiences],
    ["Pesan", report.counts.messages],
    ["Pesan belum dibaca", report.counts.unreadMessages],
    ["Kunjungan (filter)", report.visits.totalFiltered],
    ["Kunjungan (semua waktu)", report.visits.totalAllTime],
  ];
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(summaryAoa),
    "Ringkasan",
  );

  const dailyAoa: (string | number)[][] = [
    ["Tanggal", "Kunjungan"],
    ...report.visits.daily.map(
      (d) => [d.date, d.visits] as (string | number)[],
    ),
  ];
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(dailyAoa),
    "Kunjungan Harian",
  );

  const countryAoa: (string | number)[][] = [
    ["Kode", "Negara", "Kunjungan"],
    ...report.visits.topCountries.map(
      (c) => [c.countryCode, c.country, c.visits] as (string | number)[],
    ),
  ];
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet(countryAoa),
    "Top Negara",
  );

  XLSX.writeFile(workbook, reportFilename(report, "xlsx"));
}

/** PDF export via a printable window (user prints/saves as PDF). */
function pdfLegacyPrint(payload: ReportPayload, filename: string): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) throw new Error("Popup diblokir — izinkan popup untuk export PDF");
  const tablesHtml = payload.tables
    .map(
      (table) => `
      <h2>${escHtml(table.title)}</h2>
      <table>
        <thead><tr>${table.headers.map((h) => `<th>${escHtml(h)}</th>`).join("")}</tr></thead>
        <tbody>${table.rows
          .map(
            (row) =>
              `<tr>${row.map((v) => `<td>${escHtml(cell(v))}</td>`).join("")}</tr>`,
          )
          .join("")}</tbody>
      </table>`,
    )
    .join("");
  win.document.write(`<!doctype html><html><head><title>${escHtml(
    filename,
  )}</title><style>
    body{font-family:system-ui,sans-serif;color:#111;padding:24px}
    table{border-collapse:collapse;width:100%;margin-bottom:24px}
    th,td{border:1px solid #999;padding:6px 10px;text-align:left;font-size:12px}
    th{background:#eee}
  </style></head><body>
    <h1>${escHtml(payload.title)}</h1>
    <p>Period: ${escHtml(payload.period)} · Generated: ${escHtml(payload.generatedAt)}</p>
    ${tablesHtml}
    <script>window.onload=()=>window.print()<\/script>
  </body></html>`);
  win.document.close();
}

export function generateReportPdf(report: SystemReport): void;
export function generateReportPdf(
  payload: ReportPayload,
  filename: string,
): void;
export function generateReportPdf(
  input: SystemReport | ReportPayload,
  filename?: string,
): void {
  if (typeof filename === "string") {
    pdfLegacyPrint(input as ReportPayload, filename);
    return;
  }
  const report = input as SystemReport;
  const period = reportPeriodTitle(report);
  const doc = new jsPDF();
  const margin = 14;
  let y = 18;

  doc.setFontSize(16);
  doc.text("Laporan Sistem", margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.text(`Periode: ${period}`, margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metrik", "Jumlah"]],
    body: [
      ["Proyek", String(report.counts.projects)],
      ["Sertifikat", String(report.counts.certificates)],
      ["Pengalaman", String(report.counts.experiences)],
      ["Pesan", String(report.counts.messages)],
      ["Pesan belum dibaca", String(report.counts.unreadMessages)],
      ["Kunjungan (filter)", String(report.visits.totalFiltered)],
      ["Kunjungan (semua waktu)", String(report.visits.totalAllTime)],
    ],
  });

  autoTable(doc, {
    head: [["Tanggal", "Kunjungan"]],
    body: report.visits.daily.slice(0, 30).map((d) => [d.date, String(d.visits)]),
  });

  autoTable(doc, {
    head: [["Kode", "Negara", "Kunjungan"]],
    body: report.visits.topCountries.map((c) => [
      c.countryCode,
      c.country,
      String(c.visits),
    ]),
  });

  doc.save(reportFilename(report, "pdf"));
}
