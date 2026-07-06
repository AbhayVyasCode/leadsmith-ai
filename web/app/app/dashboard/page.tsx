"use client";

import * as React from "react";
import { 
  LayoutDashboard, Users, Target, Activity, Zap, Search, 
  TrendingUp, ShieldCheck, BarChart3, Database
} from "lucide-react";
import { leadsmith, RunItem, MemoryItem } from "@/lib/leadsmith-client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// Custom easing for premium agency feel
const CUBIC_EASE = [0.32, 0.72, 0, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)", 
    transition: { duration: 0.6, ease: CUBIC_EASE } 
  },
};

// Tooltip/Hover state definition for interactive charts
interface ChartHoverState {
  x: number;
  y: number;
  label: string;
  value: number;
  secondaryVal?: number;
}

/**
 * Premium Interactive SVG Area & Line Chart
 */
function YieldAreaChart({ runs }: { runs: RunItem[] }) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [viewMode, setViewMode] = React.useState<"leads" | "scans">("leads");

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/30 text-xs font-mono">
        <Database className="size-5 mb-2 stroke-[1.5]" />
        NO RUN DATA FOUND
      </div>
    );
  }

  // Sort chronologically and take last 10
  const data = [...runs]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-10);

  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingY = 24;

  const getVal = (r: RunItem) => viewMode === "leads" ? r.leads_count : (r.total_scanned || 0);
  const maxVal = Math.max(...data.map(getVal), 5);

  // Compute points
  const points = data.map((run, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const val = getVal(run);
    const y = paddingY + (1 - val / maxVal) * (height - paddingY * 2);
    return { 
      x, 
      y, 
      val, 
      date: new Date(run.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) 
    };
  });

  // Smooth curve generator using Cubic Bezier (splines instead of sharp lines)
  const getCurvePath = (pts: typeof points) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const linePath = getCurvePath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border/40 pb-3">
        <div className="flex gap-1.5 p-0.5 rounded-lg bg-muted/30 border border-border/50 w-fit">
          <button
            onClick={() => setViewMode("leads")}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md transition-all duration-300",
              viewMode === "leads" 
                ? "bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-primary" 
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            Leads Discovered
          </button>
          <button
            onClick={() => setViewMode("scans")}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md transition-all duration-300",
              viewMode === "scans" 
                ? "bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.12)] text-primary" 
                : "text-muted-foreground/60 hover:text-foreground"
            )}
          >
            Companies Scanned
          </button>
        </div>
        {hoveredIndex !== null && (
          <div className="text-[11px] font-mono text-muted-foreground animate-fade-in">
            Run Yield: <span className="text-foreground font-bold">{points[hoveredIndex].val}</span>
          </div>
        )}
      </div>

      <div className="relative h-[220px] w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-success)" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Y-Axis Value Labels & grid lines */}
          {[0, 0.5, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - paddingY * 2);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-muted-foreground/45 text-[9px] font-mono"
                >
                  {val}
                </text>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  className="stroke-border/25"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Filled Area */}
          {areaPath && (
            <motion.path
              key={`${viewMode}-area`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              d={areaPath}
              fill="url(#areaGrad)"
            />
          )}

          {/* Glowing Line */}
          {linePath && (
            <motion.path
              key={`${viewMode}-line`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: CUBIC_EASE }}
              d={linePath}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              filter="url(#glow)"
            />
          )}

          {/* X-Axis Grid Dates */}
          {points.map((p, i) => {
            if (i % 2 !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="fill-muted-foreground/40 text-[9px] font-mono"
              >
                {p.date}
              </text>
            );
          })}

          {/* Vertical Tracking Line */}
          {hoveredIndex !== null && (
            <line
              x1={points[hoveredIndex].x}
              y1={paddingY}
              x2={points[hoveredIndex].x}
              y2={height - paddingY}
              className="stroke-primary/40"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Active Highlighted Point Ring */}
          {hoveredIndex !== null && (
            <g>
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="7"
                className="fill-primary/10 stroke-primary/50 stroke-[1.5px]"
              />
              <circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r="3"
                className="fill-success"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute z-30 p-2.5 rounded-lg bg-surface/90 border border-border/80 shadow-2xl backdrop-blur-md pointer-events-none font-mono text-[10px] flex flex-col gap-1 transition-all duration-150 ease-out"
            style={{ 
              left: `${(points[hoveredIndex].x / width) * 100}%`, 
              top: `${(points[hoveredIndex].y / height) * 100 - 38}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <span className="text-muted-foreground">{points[hoveredIndex].date}</span>
            <span className="text-foreground font-bold uppercase">{viewMode}: {points[hoveredIndex].val}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * High-end Visual Glass Donut Chart
 */
function QualityDonutChart({
  high,
  med,
  low,
}: {
  high: number;
  med: number;
  low: number;
}) {
  const total = high + med + low;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/30 text-xs font-mono">
        NO QUALITY METRICS
      </div>
    );
  }

  // Concentric ring radii configuration
  const rHigh = 62;
  const rMed = 48;
  const rLow = 34;

  const cHigh = 2 * Math.PI * rHigh;
  const cMed = 2 * Math.PI * rMed;
  const cLow = 2 * Math.PI * rLow;

  const pctHigh = high / total;
  const pctMed = med / total;
  const pctLow = low / total;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Concentric Circle Visualizer */}
      <div className="relative flex items-center justify-center w-full min-h-[170px]">
        <svg className="size-[170px] -rotate-90" viewBox="0 0 160 160">
          {/* Background tracks */}
          <circle className="text-muted-foreground/5" strokeWidth="8" fill="transparent" r={rHigh} cx="80" cy="80" />
          <circle className="text-muted-foreground/5" strokeWidth="8" fill="transparent" r={rMed} cx="80" cy="80" />
          <circle className="text-muted-foreground/5" strokeWidth="8" fill="transparent" r={rLow} cx="80" cy="80" />

          {/* High Tier (Outer Ring) */}
          <motion.circle
            initial={{ strokeDashoffset: cHigh }}
            animate={{ strokeDashoffset: cHigh * (1 - pctHigh) }}
            transition={{ duration: 0.8, ease: CUBIC_EASE }}
            className="text-success drop-shadow-[0_0_6px_rgba(34,197,94,0.15)]"
            strokeWidth="8"
            strokeDasharray={cHigh}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={rHigh}
            cx="80"
            cy="80"
          />

          {/* Medium Tier (Middle Ring) */}
          <motion.circle
            initial={{ strokeDashoffset: cMed }}
            animate={{ strokeDashoffset: cMed * (1 - pctMed) }}
            transition={{ duration: 0.8, ease: CUBIC_EASE, delay: 0.1 }}
            className="text-warning drop-shadow-[0_0_6px_rgba(234,179,8,0.15)]"
            strokeWidth="8"
            strokeDasharray={cMed}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={rMed}
            cx="80"
            cy="80"
          />

          {/* Low Tier (Inner Ring) */}
          <motion.circle
            initial={{ strokeDashoffset: cLow }}
            animate={{ strokeDashoffset: cLow * (1 - pctLow) }}
            transition={{ duration: 0.8, ease: CUBIC_EASE, delay: 0.2 }}
            className="text-danger drop-shadow-[0_0_6px_rgba(239,68,68,0.15)]"
            strokeWidth="8"
            strokeDasharray={cLow}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={rLow}
            cx="80"
            cy="80"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold tracking-tight text-foreground font-mono">{total}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">Leads</span>
        </div>
      </div>

      {/* Structured Linear Progress Breakdown */}
      <div className="flex flex-col gap-3.5 border-t border-border/40 pt-4 font-mono text-[10px]">
        {/* High Match Row */}
        <div className="flex flex-col gap-1.5 group cursor-default">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-success shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
              <span className="text-muted-foreground/80 uppercase">High Match (≥75)</span>
            </div>
            <span className="text-foreground font-bold">{high} <span className="text-muted-foreground/50 font-normal">({total > 0 ? Math.round(pctHigh * 100) : 0}%)</span></span>
          </div>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? pctHigh * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: CUBIC_EASE }}
              className="h-full bg-success rounded-full"
            />
          </div>
        </div>

        {/* Medium Match Row */}
        <div className="flex flex-col gap-1.5 group cursor-default">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-warning shadow-[0_0_6px_rgba(234,179,8,0.6)]" />
              <span className="text-muted-foreground/80 uppercase">Medium Match (50-74)</span>
            </div>
            <span className="text-foreground font-bold">{med} <span className="text-muted-foreground/50 font-normal">({total > 0 ? Math.round(pctMed * 100) : 0}%)</span></span>
          </div>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? pctMed * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: CUBIC_EASE, delay: 0.1 }}
              className="h-full bg-warning rounded-full"
            />
          </div>
        </div>

        {/* Low Match Row */}
        <div className="flex flex-col gap-1.5 group cursor-default">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-danger shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
              <span className="text-muted-foreground/80 uppercase">Low Match (&lt;50)</span>
            </div>
            <span className="text-foreground font-bold">{low} <span className="text-muted-foreground/50 font-normal">({total > 0 ? Math.round(pctLow * 100) : 0}%)</span></span>
          </div>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${total > 0 ? pctLow * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: CUBIC_EASE, delay: 0.2 }}
              className="h-full bg-danger rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [runs, setRuns] = React.useState<RunItem[]>([]);
  const [memory, setMemory] = React.useState<MemoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [runsData, memData] = await Promise.all([
          leadsmith.getRuns(),
          leadsmith.getMemory()
        ]);
        setRuns(runsData.items);
        setMemory(memData.items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Compute aggregated stats
  const totalLeads = memory.length;
  const avgScore = totalLeads > 0 
    ? Math.round(memory.reduce((acc, m) => acc + m.meta.score, 0) / totalLeads)
    : 0;
  const totalScanned = runs.reduce((acc, r) => acc + (r.total_scanned || 0), 0);
  const conversionRate = totalScanned > 0 ? Math.round((totalLeads / totalScanned) * 100) : 0;

  // Breakdown tiers
  const high = memory.filter((m) => m.meta.score >= 75).length;
  const med = memory.filter((m) => m.meta.score >= 50 && m.meta.score < 75).length;
  const low = memory.filter((m) => m.meta.score < 50).length;

  if (loading) {
    return (
      <main className="flex min-h-dvh flex-col p-6 lg:p-10">
        <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col gap-6 animate-pulse">
          <header className="border-b border-border/40 pb-4 h-16 bg-muted/20 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 rounded-2xl border border-border/40 bg-muted/10" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-72 lg:col-span-2 border border-border/40 bg-muted/10 rounded-2xl" />
            <div className="h-72 border border-border/40 bg-muted/10 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col gap-8">
        
        {/* Compact Header & Status Line */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <LayoutDashboard className="size-4 stroke-[2]" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
                ENGINE STATS
              </h1>
            </div>
            <p className="text-[12px] text-muted-foreground/80 font-mono">
              REAL-TIME REPORT & AGGREGATE SYSTEM METRICS
            </p>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-success-soft border border-success/20 text-success text-[11px] font-bold uppercase tracking-wider font-mono">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Active Discovery Node
          </div>
        </header>

        {/* Bento KPI Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } }
          }}
        >
          {/* Card 1: Total Leads */}
          <motion.div 
            variants={FADE_UP} 
            className="group relative overflow-hidden rounded-2xl bg-surface/40 p-5 ring-1 ring-border/50 transition-all duration-300 hover:ring-primary/40 hover:scale-[0.99] cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 font-mono">Verified Leads</span>
              <Users className="size-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-300" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight font-mono">{totalLeads}</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-muted-foreground/50">
              AGGREGATED RAG MEMORY ENTRIES
            </div>
          </motion.div>

          {/* Card 2: Average Score */}
          <motion.div 
            variants={FADE_UP} 
            className="group relative overflow-hidden rounded-2xl bg-surface/40 p-5 ring-1 ring-border/50 transition-all duration-300 hover:ring-warning/40 hover:scale-[0.99] cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 font-mono">Avg Score Match</span>
              <Target className="size-4 text-muted-foreground/50 group-hover:text-warning transition-colors duration-300" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight font-mono">{avgScore}</span>
              <span className="text-[12px] font-bold font-mono text-muted-foreground">/ 100</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-muted-foreground/50">
              ICP FIT SCORE CALIBRATION
            </div>
          </motion.div>

          {/* Card 3: Total Scanned */}
          <motion.div 
            variants={FADE_UP} 
            className="group relative overflow-hidden rounded-2xl bg-surface/40 p-5 ring-1 ring-border/50 transition-all duration-300 hover:ring-success/40 hover:scale-[0.99] cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 font-mono">Companies Scanned</span>
              <Search className="size-4 text-muted-foreground/50 group-hover:text-success transition-colors duration-300" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight font-mono">{totalScanned.toLocaleString()}</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-muted-foreground/50">
              TOTAL VISITED TARGET URLS
            </div>
          </motion.div>

          {/* Card 4: Run Conversion Rate */}
          <motion.div 
            variants={FADE_UP} 
            className="group relative overflow-hidden rounded-2xl bg-surface/40 p-5 ring-1 ring-border/50 transition-all duration-300 hover:ring-secondary/40 hover:scale-[0.99] cursor-default"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-foreground/60 font-mono">Scan Conversion</span>
              <TrendingUp className="size-4 text-muted-foreground/50 group-hover:text-secondary transition-colors duration-300" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight font-mono">{conversionRate}%</span>
            </div>
            <div className="mt-2 text-[10px] font-mono text-muted-foreground/50">
              DISCOVERY ACCURACY VALUE
            </div>
          </motion.div>
        </motion.div>

        {/* Charts & Interactive Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          
          {/* Left Column: Yield Timeline Area Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2 rounded-2xl border border-border/60 bg-surface/20 p-6 flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-primary" />
                <h3 className="text-[13px] font-bold uppercase tracking-wider font-mono text-foreground">
                  Performance Timeline
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground/60 font-mono">HISTORICAL DISCOVERY YIELD</span>
            </div>
            <div className="flex-1 w-full min-h-[220px]">
              <YieldAreaChart runs={runs} />
            </div>
          </motion.div>

          {/* Right Column: Donut & Detail List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-surface/20 p-6 flex flex-col gap-6"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-success" />
              <h3 className="text-[13px] font-bold uppercase tracking-wider font-mono text-foreground">
                Lead Score Quality
              </h3>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <QualityDonutChart high={high} med={med} low={low} />
            </div>
          </motion.div>
        </div>

        {/* Live Active Feed (Most Advanced Feature) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-border/60 bg-surface/20 p-6 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-secondary animate-pulse" />
              <h3 className="text-[13px] font-bold uppercase tracking-wider font-mono text-foreground">
                Recent Lead Stream
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground/60 font-mono">LIVE SYNCED RECORDS</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {memory.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-muted-foreground/40">
                NO ACTIVE LEADS REGISTERED IN SYSTEM MEMORY
              </div>
            ) : (
              memory.slice(0, 5).map((item, idx) => {
                const domain = item.meta.website.replace(/^https?:\/\//, "").replace(/\/$/, "");
                const score = item.meta.score;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex justify-between items-center p-3 rounded-xl bg-surface/30 border border-border/40 hover:border-border transition-all duration-300"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs font-bold text-foreground truncate">{item.meta.company}</span>
                      <span className="text-[10px] font-mono text-muted-foreground truncate">{domain}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Interactive Badge indicating match tier */}
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase tracking-wide",
                        score >= 75 ? "bg-success-soft text-success" :
                        score >= 50 ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger"
                      )}>
                        Score: {score}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
