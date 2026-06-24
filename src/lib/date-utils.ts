export function todayISO(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = (d.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = d.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function weekdayName(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long" });
}

export function getWeekDates(iso: string): string[] {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay(); // 0..6 (Sun..Sat)
  // Start on Monday
  const offsetToMonday = (dow + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - offsetToMonday);
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    out.push(
      `${x.getFullYear()}-${(x.getMonth() + 1).toString().padStart(2, "0")}-${x
        .getDate()
        .toString()
        .padStart(2, "0")}`,
    );
  }
  return out;
}

export function getMonthDates(iso: string): string[] {
  const [y, m] = iso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate(); // m is already 1-indexed from split
  const out: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    out.push(
      `${y}-${m.toString().padStart(2, "0")}-${d.toString().padStart(2, "0")}`,
    );
  }
  return out;
}

export function getMonthName(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function getMonthStartEnd(iso: string): { start: string; end: string } {
  const [y, m] = iso.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const mStr = m.toString().padStart(2, "0");
  return {
    start: `${y}-${mStr}-01`,
    end: `${y}-${mStr}-${daysInMonth.toString().padStart(2, "0")}`,
  };
}
