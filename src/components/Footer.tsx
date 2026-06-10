import { Github, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-6 mt-auto">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 text-sm text-muted-foreground">
        <span>&copy; {currentYear}</span>
        <span className="text-border/60">|</span>
        <span className="text-foreground">Developed by Saif(Jeff) Waseem</span>
        <span className="text-border/60">|</span>
        <a
          href="https://github.com/sa1ffffff"
          target="_blank"
          rel="noreferrer"
          className="text-foreground transition-colors hover:text-primary"
          aria-label="GitHub Profile"
        >
          <Github className="h-[18px] w-[18px]" strokeWidth={2} />
        </a>
        <span className="text-muted-foreground/40">&middot;</span>
        <a
          href="mailto:saifullahwaseem.dev@gmail.com"
          className="text-foreground transition-colors hover:text-primary"
          aria-label="Email"
        >
          <Mail className="h-[18px] w-[18px]" strokeWidth={2} />
        </a>
      </div>
    </footer>
  );
}
