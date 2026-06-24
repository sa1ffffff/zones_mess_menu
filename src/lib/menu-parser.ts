// Parses a monthly menu (markdown or plain text). Extracts ONLY dinner entries.
// Handles two common shapes:
//   1) Bullet lists under "Dinner" / "**Dinner**" headers
//   2) Bare date lines (e.g. "2026-06-10") followed by
//      "Dinner | 7:30 PM - 9:00 PM" and a comma-separated items line.

export type ParsedDinner = {
  date: string; // YYYY-MM-DD
  time_start: string;
  time_end: string;
  menu_items: string[];
};

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const pad = (n: number) => n.toString().padStart(2, "0");
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

function tryParseDate(raw: string, fallbackYear: number): string | null {
  const s = raw
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/[—–-]+\s*(breakfast|lunch|dinner).*$/i, "")
    .trim();

  // ISO YYYY-MM-DD (most strict first)
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // "June 10, 2026" / "Tuesday, June 10 2026" / "10 June 2026"
  const m1 = s.match(/(?:^|\s)([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?/);
  if (m1 && MONTHS[m1[1].toLowerCase()] !== undefined) {
    const mon = MONTHS[m1[1].toLowerCase()];
    const day = parseInt(m1[2], 10);
    const yr = m1[3] ? parseInt(m1[3], 10) : fallbackYear;
    return toISO(yr, mon, day);
  }
  const m2 = s.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:[,\s]+(\d{4}))?/);
  if (m2 && MONTHS[m2[2].toLowerCase()] !== undefined) {
    const mon = MONTHS[m2[2].toLowerCase()];
    const day = parseInt(m2[1], 10);
    const yr = m2[3] ? parseInt(m2[3], 10) : fallbackYear;
    return toISO(yr, mon, day);
  }
  // dd/mm/yyyy
  const m3 = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
  if (m3) {
    const d = parseInt(m3[1], 10);
    const mo = parseInt(m3[2], 10) - 1;
    let y = parseInt(m3[3], 10);
    if (y < 100) y += 2000;
    return toISO(y, mo, d);
  }
  return null;
}

function parseTimeRange(line: string): { start: string; end: string } | null {
  const m = line.match(
    /(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,
  );
  if (!m) return null;
  const clean = (t: string) => t.replace(/\s+/g, " ").toUpperCase();
  return { start: clean(m[1]), end: clean(m[2]) };
}

function detectMeal(line: string): "breakfast" | "lunch" | "dinner" | null {
  const t = line.toLowerCase();
  // Must look like a header for the meal, not just contain the word inside items
  if (/^\s*(?:#+\s*|\*+\s*)?(breakfast)\b/.test(t)) return "breakfast";
  if (/^\s*(?:#+\s*|\*+\s*)?(lunch)\b/.test(t)) return "lunch";
  if (/^\s*(?:#+\s*|\*+\s*)?(dinner)\b/.test(t)) return "dinner";
  return null;
}

function splitItems(line: string): string[] {
  // Strip leading list markers and bold
  const cleaned = line
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/\*\*/g, "")
    .trim();
  if (!cleaned) return [];
  // If it contains commas, treat as a list. Otherwise, single item.
  if (cleaned.includes(",")) {
    return cleaned
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [cleaned];
}

export function parseMenuMarkdown(md: string): ParsedDinner[] {
  const fallbackYear = new Date().getFullYear();
  const lines = md.split(/\r?\n/);

  const dinners: ParsedDinner[] = [];
  let currentDate: string | null = null;
  let currentMeal: "breakfast" | "lunch" | "dinner" | null = null;
  let current: ParsedDinner | null = null;

  const flush = () => {
    if (current && current.menu_items.length > 0) dinners.push(current);
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // 1) Date line? (heading-style OR bare date like "2026-06-10")
    const maybeDate = tryParseDate(line, fallbackYear);
    if (maybeDate && /^\s*(?:#+|\*+)?\s*(?:[A-Za-z]+,?\s+)?(\d{4}-\d{2}-\d{2}|[A-Za-z]+\s+\d|\d{1,2}\s+[A-Za-z]+|\d{1,2}[/.])/i.test(line)) {
      flush();
      currentDate = maybeDate;
      currentMeal = null;
      continue;
    }

    // 2) Meal header (with optional "| time - time")
    const meal = detectMeal(line);
    if (meal && currentDate) {
      flush();
      currentMeal = meal;
      if (meal === "dinner") {
        current = {
          date: currentDate,
          time_start: "7:30 PM",
          time_end: "9:00 PM",
          menu_items: [],
        };
        const tr = parseTimeRange(line);
        if (tr) {
          current.time_start = tr.start;
          current.time_end = tr.end;
        }
      }
      continue;
    }

    // 3) Content under the current meal
    if (currentMeal === "dinner" && current) {
      // Allow a standalone time line after a Dinner header
      const tr = parseTimeRange(line);
      if (tr && !/[A-Za-z]{4,}/.test(line.replace(/AM|PM/gi, ""))) {
        current.time_start = tr.start;
        current.time_end = tr.end;
        continue;
      }
      const items = splitItems(line);
      for (const it of items) {
        if (it && !/^[-=_]{3,}$/.test(it)) current.menu_items.push(it);
      }
    }
  }
  flush();

  // Deduplicate by date (last write wins)
  const map = new Map<string, ParsedDinner>();
  for (const d of dinners) map.set(d.date, d);
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}
