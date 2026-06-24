import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signInWithGoogle } from "@/lib/auth";
import { parseMenuMarkdown, type ParsedDinner } from "@/lib/menu-parser";
import { formatLongDate } from "@/lib/date-utils";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  MessageSquare,
  Clock,
  User,
  Building2,
  ChevronDown,
  Copy,
  Check,
  Download,
  Sparkles,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Zones Dinner Menu" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Query = {
  id: string;
  name: string;
  department: string;
  feedback: string;
  created_at: string;
};

async function fetchQueries(): Promise<Query[]> {
  const { data, error } = await supabase
    .from("queries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Query[];
}

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"menu" | "queries">("menu");
  const [md, setMd] = useState("");
  const [parsed, setParsed] = useState<ParsedDinner[]>([]);
  const [saving, setSaving] = useState(false);

  const queriesQ = useQuery({
    queryKey: ["queries"],
    queryFn: fetchQueries,
    enabled: !!user && activeTab === "queries",
    refetchInterval: activeTab === "queries" ? 30_000 : false,
  });

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setMd(text);
      setParsed(parseMenuMarkdown(text));
    };
    reader.readAsText(f);
  }

  function reparse(text: string) {
    setMd(text);
    setParsed(parseMenuMarkdown(text));
  }

  async function save() {
    if (parsed.length === 0) {
      toast.error("Nothing to save");
      return;
    }
    setSaving(true);
    const rows = parsed.map((p) => ({
      date: p.date,
      time_start: p.time_start,
      time_end: p.time_end,
      menu_items: p.menu_items,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase.from("dinners").upsert(rows, { onConflict: "date" });
    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    toast.success(`Saved ${rows.length} dinner${rows.length === 1 ? "" : "s"} to the live menu`);
    // Invalidate dinner queries so the homepage picks up new data immediately
    queryClient.invalidateQueries({ queryKey: ["dinners"] });
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Admin
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {activeTab === "menu" ? "Upload monthly menu" : "User Queries"}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {activeTab === "menu"
                ? "Upload a markdown file to update the live dinner menu. Only dinner entries are extracted."
                : "All queries submitted by users are listed below. Newest first."}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-1 rounded-full border border-border bg-card p-1 w-fit shadow-sm">
          {(["menu", "queries"] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                id={`admin-tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "focus-ring relative z-10 flex items-center gap-1.5 rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-tab-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {tab === "menu" ? (
                  <FileText className="h-3.5 w-3.5" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                {tab === "menu" ? "Menu Upload" : "Queries"}
                {tab === "queries" && queriesQ.data && queriesQ.data.length > 0 && (
                  <span className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {queriesQ.data.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Info banner — replaces the old hardcoded warning */}
        {activeTab === "menu" && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">Upload the monthly menu here</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Paste or upload a markdown file containing the month's dinner menu. The parser will extract dinner entries automatically.
                Don't have a markdown file? Use the <strong>AI Prompt</strong> below to convert a picture of your menu into the correct format.
              </p>
            </div>
          </div>
        )}

        {authLoading ? null : !user ? (
          <div className="surface-card mt-10 flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-sm text-muted-foreground">Sign in to manage the menu.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => signInWithGoogle()}
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              >
                Continue with Google
              </Button>
            </div>
          </div>
        ) : user.email !== "saifullahwasim1@gmail.com" ? (
          <div className="surface-card mt-10 flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-lg font-semibold text-destructive">Access Denied</p>
            <p className="text-sm text-muted-foreground">
              Only the administrator (saifullahwasim1@gmail.com) can access this page.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "menu" ? (
              <motion.div
                key="menu-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-10 space-y-6"
              >
                {/* AI Prompt Helper */}
                <AiPromptHelper />

                {/* Upload + Preview grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="surface-card flex flex-col p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold">Markdown</div>
                      <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium hover:bg-muted">
                        <Upload className="h-3.5 w-3.5" />
                        Upload .md
                        <input
                          type="file"
                          accept=".md,.markdown,text/markdown,text/plain"
                          onChange={onFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <Textarea
                      value={md}
                      onChange={(e) => reparse(e.target.value)}
                      placeholder={SAMPLE}
                      className="min-h-[420px] resize-none rounded-xl border-border bg-muted/30 font-mono text-xs leading-relaxed"
                    />
                  </section>

                  <section className="flex flex-col gap-4">
                    <div className="surface-card flex items-center justify-between p-4">
                      <div className="inline-flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {parsed.length} dinner{parsed.length === 1 ? "" : "s"} parsed
                      </div>
                      <Button
                        onClick={save}
                        disabled={parsed.length === 0 || saving}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {saving ? "Saving…" : "Save to Live Menu"}
                      </Button>
                    </div>

                    <div className="surface-card max-h-[460px] overflow-auto p-4">
                      {parsed.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          Preview will appear here once your markdown is recognized.
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {parsed.map((p, i) => (
                            <motion.li
                              key={p.date}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className="rounded-xl border border-border bg-muted/30 p-4"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <div className="text-sm font-semibold">{formatLongDate(p.date)}</div>
                                <div className="text-xs text-muted-foreground">
                                  {p.time_start} to {p.time_end}
                                </div>
                              </div>
                              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                                {p.menu_items.map((it, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-xs text-foreground"
                                  >
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                                    {it}
                                  </li>
                                ))}
                              </ul>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="queries-tab"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-10"
              >
                {queriesQ.isLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="surface-card animate-pulse p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-muted" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-28 rounded bg-muted" />
                            <div className="h-2.5 w-20 rounded bg-muted" />
                          </div>
                        </div>
                        <div className="mt-3 h-3 w-full rounded bg-muted/70" />
                        <div className="mt-1.5 h-3 w-4/5 rounded bg-muted/70" />
                      </div>
                    ))}
                  </div>
                ) : queriesQ.error ? (
                  <div className="surface-card flex flex-col items-center gap-3 p-12 text-center">
                    <p className="text-sm font-medium text-destructive">Failed to load queries</p>
                    <p className="text-xs text-muted-foreground">{String(queriesQ.error)}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => queriesQ.refetch()}
                      className="mt-2 rounded-full"
                    >
                      Try again
                    </Button>
                  </div>
                ) : !queriesQ.data || queriesQ.data.length === 0 ? (
                  <div className="surface-card flex flex-col items-center gap-4 p-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <MessageSquare className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">No queries yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        User queries will appear here once they are submitted from the homepage.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queriesQ.data.map((q, i) => (
                      <QueryCard key={q.id} query={q} index={i} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * AI Prompt Helper – collapsible section with a copyable prompt
 * for converting a menu picture into the required markdown format.
 * ───────────────────────────────────────────────────────── */
function AiPromptHelper() {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopied(true);
      toast.success("Prompt copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy — try the download button instead");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([AI_PROMPT], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zones_menu_converter_prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Prompt downloaded!");
  };

  return (
    <div className="surface-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left"
        id="ai-prompt-toggle"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-violet-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              AI Menu Converter
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Copy this prompt and paste it into ChatGPT, Claude, or any AI with a picture of your menu
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-5 pb-5">
              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  id="copy-ai-prompt-btn"
                >
                  {copied ? (
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy Prompt"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownload}
                  className="rounded-full"
                  id="download-ai-prompt-btn"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download as .txt
                </Button>
              </div>

              {/* Prompt preview */}
              <div className="mt-4 max-h-[320px] overflow-auto rounded-xl border border-border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80">
                  {AI_PROMPT}
                </pre>
              </div>

              {/* Usage instructions */}
              <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-semibold text-foreground mb-2">How to use:</p>
                <ol className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                    Copy the prompt above
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                    Open ChatGPT, Claude, or any AI tool and paste the prompt
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                    Attach the picture of your monthly menu
                  </li>
                  <li className="flex gap-2">
                    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">4</span>
                    Copy the AI's output and paste it in the Markdown box above, or save as a .md file and upload
                  </li>
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 * QueryCard — unchanged from before
 * ───────────────────────────────────────────────────────── */
function QueryCard({ query, index }: { query: Query; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(query.created_at);
  const timeAgo = getTimeAgo(date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="surface-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left"
        id={`query-card-${query.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {query.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{query.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  {query.department}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </div>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>

        <p className={cn(
          "mt-3 text-sm text-foreground leading-relaxed",
          !expanded && "line-clamp-2",
        )}>
          {query.feedback}
        </p>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-5 py-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {query.name}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {query.department}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {date.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

const SAMPLE = `## Monday, June 9 2026
**Dinner** 7:30 PM - 9:00 PM
- Chicken Karahi
- Daal Mash
- Naan
- Kheer

## Tuesday, June 10 2026
**Dinner** 7:30 PM - 9:00 PM
- Beef Pulao
- Raita
- Salad
- Gulab Jamun
`;

const AI_PROMPT = `You are a food menu data extraction assistant. I will provide you with an image of a monthly food menu (typically for a mess/hostel/cafeteria). Your job is to convert it into a structured markdown file that can be parsed by a menu management system.

CRITICAL RULES — follow these EXACTLY:

1. ONLY dinner is served at Zones so menu only has that
2. Each day MUST have its own heading using this exact format:
   ## DayName, MonthName DD YYYY
   Example: ## Monday, June 1 2026

3. Immediately below each date heading, add the dinner header:
   **Dinner**

4. List each menu item as a markdown bullet point (using "-"):
   - Item Name

5. One item per line. Do NOT combine multiple items on a single line with commas.

6. Preserve the exact food names as written on the menu. Do not translate, correct spelling, or modify names.

7. Skip weekends (Saturday and Sunday) — there is no dinner service on weekends.

8. If a date has no dinner listed, skip it entirely.

9. Include ALL weeks of the month. Do not stop early.

10. Use the actual year shown on the menu. If no year is visible, use the current year.

EXPECTED OUTPUT FORMAT:

## Monday, June 1 2026
**Dinner** 7:30 PM - 9:00 PM
- Fresh Salad
- Raita
- Naan & Roti
- Chicken Karahi

## Tuesday, June 2 2026
**Dinner** 7:30 PM - 9:00 PM
- Fresh Salad
- Raita + Achar
- Kaly Masar
- White Rice
- Live Jalabi

## Wednesday, June 3 2026
**Dinner** 7:30 PM - 9:00 PM
- Fresh Salad
- Mint Chattni
- Daal Makhni
- Naan & Roti

(... continue for every weekday in the month)

IMPORTANT:
- Output ONLY the markdown. No explanations, no commentary, no "here is the converted menu" text.
- Start immediately with the first ## heading.
- End after the last dinner entry.

Now, please convert the attached menu image into this exact format.`;
