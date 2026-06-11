import { useEffect, useState } from "react";

export function AmbientBackground() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkDark();
    
    // Setup observer to watch for theme changes on html element
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  if (!isDark) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background">
      {/* Glows Container - Using absolute positioning to keep them within the viewport */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Primary glow behind hero/top-left (Deep Blue) */}
        <div className="absolute top-[-15%] left-[10%] w-[900px] h-[900px] rounded-full bg-[#2563EB] opacity-[0.14] blur-[120px] mix-blend-screen animate-float-slow" />
        
        {/* Secondary glow behind menu card/right (Cyan/Sky) */}
        <div className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-[#0EA5E9] opacity-[0.10] blur-[100px] mix-blend-screen animate-float-medium" />
        
        {/* Subtle purple accent for depth bottom-right */}
        <div className="absolute bottom-[-20%] right-[20%] w-[800px] h-[800px] rounded-full bg-[#8B5CF6] opacity-[0.08] blur-[130px] mix-blend-screen animate-float-fast" />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 z-10 opacity-[0.025] mix-blend-overlay pointer-events-none noise-bg" />
      
      {/* Vignette */}
      <div className="absolute inset-0 z-20 pointer-events-none vignette-overlay opacity-80" />
    </div>
  );
}
