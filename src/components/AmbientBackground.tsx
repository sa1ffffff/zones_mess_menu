import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function AmbientBackground() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkDark();
    setMounted(true);
    
    // Setup observer to watch for theme changes on html element
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background transition-colors duration-300">
      {/* Glows Container - Using absolute positioning to keep them within the viewport */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Primary glow behind hero/top-left (Deep Blue) */}
        <div 
          className={cn(
            "absolute top-[-15%] left-[10%] w-[900px] h-[900px] rounded-full bg-[#2563EB] blur-[120px] animate-float-slow transition-opacity duration-1000",
            isDark ? "opacity-[0.14] mix-blend-screen" : "opacity-[0.15] mix-blend-multiply"
          )} 
        />
        
        {/* Secondary glow behind menu card/right (Cyan/Sky) */}
        <div 
          className={cn(
            "absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#0EA5E9] blur-[100px] animate-float-medium transition-opacity duration-1000",
            isDark ? "opacity-[0.10] mix-blend-screen" : "opacity-[0.12] mix-blend-multiply"
          )} 
        />
        
        {/* Subtle purple accent for depth bottom-right */}
        <div 
          className={cn(
            "absolute bottom-[-20%] right-[20%] w-[800px] h-[800px] rounded-full bg-[#8B5CF6] blur-[130px] animate-float-fast transition-opacity duration-1000",
            isDark ? "opacity-[0.08] mix-blend-screen" : "opacity-[0.08] mix-blend-multiply"
          )} 
        />
      </div>

      {/* Noise overlay */}
      <div 
        className={cn(
          "absolute inset-0 z-10 mix-blend-overlay pointer-events-none noise-bg transition-opacity duration-1000",
          isDark ? "opacity-[0.025]" : "opacity-[0.04]"
        )} 
      />
      
      {/* Vignette */}
      <div 
        className={cn(
          "absolute inset-0 z-20 pointer-events-none vignette-overlay transition-opacity duration-1000",
          isDark ? "opacity-80" : "opacity-30"
        )} 
      />
    </div>
  );
}
