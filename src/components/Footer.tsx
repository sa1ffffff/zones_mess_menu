import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-border/40 bg-background/50 backdrop-blur-sm relative z-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
        <p className="text-xs font-medium tracking-wide text-muted-foreground/70">
          developed by <span className="text-foreground/90 font-semibold tracking-normal">Saif(Jeff) Waseem</span>
        </p>
        <a
          href="https://github.com/sa1ffffff"
          target="_blank"
          rel="noreferrer"
          className="group rounded-full p-2 transition-all hover:bg-muted"
          aria-label="GitHub Profile"
        >
          <Github className="h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" strokeWidth={2} />
        </a>
      </div>
    </footer>
  );
}
