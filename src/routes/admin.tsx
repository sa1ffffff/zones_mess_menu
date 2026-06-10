import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signInWithGoogle } from "@/lib/auth";
import { parseMenuMarkdown, type ParsedDinner } from "@/lib/menu-parser";
import { formatLongDate } from "@/lib/date-utils";
import { toast } from "sonner";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Zones Dinner Menu" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [md, setMd] = useState("");
  const [parsed, setParsed] = useState<ParsedDinner[]>([]);
  const [saving, setSaving] = useState(false);

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
    toast.success(`Saved ${rows.length} dinner${rows.length === 1 ? "" : "s"}`);
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
              Upload monthly menu
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Paste a markdown file or upload one. Only dinner entries are extracted;
              breakfast and lunch are ignored.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-amber-500/90 text-sm flex items-start gap-3">
          <span className="mt-0.5 text-lg">⚠️</span>
          <div>
            <p className="font-semibold">Notice: Active Menu is Hardcoded</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              The application has been configured to read the food menu directly from static files in the codebase (updated monthly). 
              Changes uploaded through this admin page will be written to the database but will <strong>not</strong> affect the active live menu. 
              To update the menu, edit the <code>src/lib/menu-data.ts</code> file in the repository.
            </p>
          </div>
        </div>

        {authLoading ? null : !user ? (
          <div className="surface-card mt-10 flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-sm text-muted-foreground">Sign in to manage the menu.</p>
            <Button
              onClick={() => signInWithGoogle()}
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
            >
              Continue with Google
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
                  disabled={true}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 opacity-60 cursor-not-allowed"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Save Disabled
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
        )}
      </main>
    </div>
  );
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
