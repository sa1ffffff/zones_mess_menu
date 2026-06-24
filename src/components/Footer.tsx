import { Github, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 mt-auto">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Gradient divider */}
        <div
          className="mb-6 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--border) 60%, transparent) 20%, color-mix(in oklab, var(--border) 80%, transparent) 50%, color-mix(in oklab, var(--border) 60%, transparent) 80%, transparent)",
          }}
        />
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <span className="text-xs text-muted-foreground/70">
            &copy; {currentYear} · All rights reserved
          </span>
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground tracking-tight">
            <span>Developed by</span>
            <a
              href="https://saifullahwaseem.dev"
              target="_blank"
              rel="noreferrer"
              className="group relative inline-flex items-center text-foreground transition-colors hover:text-primary"
            >
              Saif (Jeff) Waseem
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary/80 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/sa1ffffff"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:scale-110 hover:shadow-sm"
              aria-label="GitHub Profile"
            >
              <Github className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=saifullahwasim1@gmail.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:scale-110 hover:shadow-sm"
              aria-label="Email"
            >
              <Mail className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

