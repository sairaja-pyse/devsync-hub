import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, FolderKanban, Target, Briefcase,
  Kanban, Sparkles, Calendar, Code2,
  TrendingUp, Flame, ChevronUp, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

/* ─────────────────────────────────────────── */

// const features = [
//   { icon: FolderKanban, label: "Projects",    color: "text-violet-500",  bg: "bg-violet-500/10"  },
//   { icon: Kanban,       label: "Kanban Board",color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
//   { icon: Target,       label: "Goals",       color: "text-emerald-500", bg: "bg-emerald-500/10" },
//   { icon: Briefcase,    label: "Job Tracker", color: "text-amber-500",   bg: "bg-amber-500/10"   },
//   { icon: Sparkles,     label: "Skills",      color: "text-cyan-500",    bg: "bg-cyan-500/10"    },
//   { icon: Calendar,     label: "Calendar",    color: "text-rose-500",    bg: "bg-rose-500/10"    },
// ];

// const highlights = [
//   {
//     icon: Code2,
//     title: "Track Everything",
//     desc: "Projects, tasks, and milestones in one beautiful workspace.",
//     accent: "from-violet-500/20 to-purple-500/5",
//     iconBg: "bg-violet-500/15",
//     iconColor: "text-violet-500",
//   },
//   {
//     icon: TrendingUp,
//     title: "Grow Faster",
//     desc: "Set goals, track skills, and visualize your progress.",
//     accent: "from-fuchsia-500/20 to-pink-500/5",
//     iconBg: "bg-fuchsia-500/15",
//     iconColor: "text-fuchsia-500",
//   },
//   {
//     icon: Flame,
//     title: "Land Your Dream Job",
//     desc: "Manage every application, interview, and offer.",
//     accent: "from-amber-500/20 to-orange-500/5",
//     iconBg: "bg-amber-500/15",
//     iconColor: "text-amber-500",
//   },
// ];

// const stats = [
//   { value: "6+",    label: "Modules" },
//   { value: "100%",  label: "Offline" },
//   { value: "Free",  label: "Forever" },
// ];

/* ─────────────────────────────────────────── */

export default function LandingPage() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);
  const touchStartY = useRef<number>(0);

  const enter = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => navigate("/dashboard"), 560);
  }, [exiting, navigate]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 60) enter();
  };

  return (
    <div
      className="landing-bg min-h-screen relative overflow-hidden flex flex-col"
      style={exiting ? { animation: "landingExit 0.56s cubic-bezier(0.4,0,0.2,1) forwards" } : undefined}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Floating blobs ── */}
      <div
        aria-hidden
        className="animate-blob pointer-events-none fixed -top-32 -left-32 w-[520px] h-[520px] opacity-30 dark:opacity-20"
        style={{ background: "radial-gradient(circle, hsl(252 94% 68%), hsl(252 94% 58%) 40%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="animate-blob animate-blob-delay-2 pointer-events-none fixed -bottom-40 -right-32 w-[480px] h-[480px] opacity-25 dark:opacity-18"
        style={{ background: "radial-gradient(circle, hsl(296 94% 68%), hsl(296 94% 58%) 40%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="animate-blob animate-blob-delay-4 pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[360px] opacity-15 dark:opacity-10"
        style={{ background: "radial-gradient(circle, hsl(280 90% 65%), transparent 70%)", filter: "blur(80px)" }}
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-[12px] gradient-primary flex items-center justify-center animate-glow-pulse">
            <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <span className="font-display font-bold text-base tracking-tight">DevSync</span>
            <span className="text-[10px] text-muted-foreground font-semibold tracking-widest block -mt-0.5">HUB</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={enter}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-primary/30 text-primary hover:bg-primary/8 transition-all duration-200"
          >
            Enter App <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-4 pb-40 sm:pt-8">

        {/* Badge */}
        {/* <div className="animate-slide-up stagger-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-bold mb-7 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Developer Productivity Suite
        </div> */}

        {/* Headline */}
        <h1
          className="landing-headline text-[3.2rem] sm:text-[5rem] lg:text-[6.5rem] animate-slide-up stagger-2 max-w-4xl"
          style={{ animationFillMode: "both" }}
        >
          Your's {" "}
          <span
            className="landing-headline"
            style={{
              background: "linear-gradient(135deg, hsl(252 94% 62%), hsl(296 94% 65%), hsl(252 80% 70%))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 3s linear infinite",
            }}
          >
            Workspace
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-5 text-muted-foreground text-base sm:text-lg max-w-md leading-relaxed animate-slide-up stagger-3"
          style={{ animationFillMode: "both" }}
        >
          Track projects, crush goals, land your dream job —{" "}
          <span className="text-foreground font-medium">all in one place.</span>
        </p>

        {/* Feature pills */}
        {/* <div
          className="flex flex-wrap justify-center gap-2 mt-8 max-w-lg animate-slide-up stagger-4"
          style={{ animationFillMode: "both" }}
        >
          {features.map(({ icon: Icon, label, color, bg }) => (
            <button key={label} onClick={enter} className="feature-pill group">
              <span className={cn("h-5 w-5 rounded-md flex items-center justify-center", bg)}>
                <Icon className={cn("h-3 w-3", color)} />
              </span>
              <span className="group-hover:text-primary transition-colors">{label}</span>
            </button>
          ))}
        </div>

        {/* Highlight cards */}
        {/* <div
          className="grid sm:grid-cols-3 gap-3 mt-10 w-full max-w-3xl animate-slide-up stagger-5"
          style={{ animationFillMode: "both" }}
        >
          {highlights.map(({ icon: Icon, title, desc, accent, iconBg, iconColor }) => (
            <div key={title} className={cn("highlight-card bg-gradient-to-br text-left", accent)}>
              <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center mb-3", iconBg)}>
                <Icon className={cn("h-5 w-5", iconColor)} />
              </div>
              <h3 className="font-display font-bold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div> */}

        {/* Stats row */}
        <div
          className="flex items-center gap-6 sm:gap-10 mt-8 animate-slide-up stagger-6"
          style={{ animationFillMode: "both" }}
        >
          {/* {stats.map(({ value, label }, i) => (
            <div key={label} className="text-center">
              {i > 0 && <div className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 h-3 w-px bg-border" />}
              <p className="font-display font-bold text-xl gradient-text">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))} */}
        </div>
      </main>

      {/* ── Swipe / Enter button (fixed bottom) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-8 sm:pb-10 gap-3 pointer-events-none">
        {/* Fade gradient above */}
        <div
          className="absolute bottom-full left-0 right-0 h-24 pointer-events-none"
          style={{ background: "linear-gradient(to top, hsl(var(--background)), transparent)" }}
        />

        {/* Handle */}
        <div className="swipe-handle pointer-events-auto" />

        {/* Swipe instruction */}
        <p className="text-[11px] text-muted-foreground font-medium tracking-wide pointer-events-none">
          Swipe up or tap to enter
        </p>

        {/* Enter button */}
        <button
          onClick={enter}
          className="swipe-button pointer-events-auto animate-glow-pulse"
        >
          <ChevronUp className="h-5 w-5 animate-bounce-up" strokeWidth={2.5} />
          Enter Dashboard
          <ChevronUp className="h-5 w-5 animate-bounce-up stagger-2" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
