import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StarRow } from "./Stars";
import type { Rating } from "@/lib/data";

export function RecentRatings({ date }: { date: string }) {
  const { data } = useQuery({
    queryKey: ["ratings", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("date", date)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as Rating[];
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        No ratings yet. Be the first to rate!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Recent ratings
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {data.map((r) => (
          <li key={r.id} className="inline-flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{r.user_name}</span>
            <StarRow value={r.stars} size={12} />
          </li>
        ))}
      </ul>
    </div>
  );
}
