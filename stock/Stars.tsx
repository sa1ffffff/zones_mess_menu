import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StarRow({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.75;
  const rounded = value - full >= 0.75 ? full + 1 : full;
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < rounded || (half && i === full);
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={cn(
              "transition-colors",
              filled ? "fill-[var(--color-star)] text-[var(--color-star)]" : "text-border",
            )}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

export function StarPicker({
  value,
  onChange,
  size = 32,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="inline-flex items-center gap-1.5" role="radiogroup" aria-label="Rate dinner">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= display;
        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="focus-ring rounded-md p-1 transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              width={size}
              height={size}
              className={cn(
                "transition-colors",
                active ? "fill-[var(--color-star)] text-[var(--color-star)]" : "text-border",
              )}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
