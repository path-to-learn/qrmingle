import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Review } from "@shared/schema";
import { Button } from "@/components/ui/button";
import ReviewSubmitForm from "@/components/reviews/ReviewSubmitForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Star, Settings2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CardStyle = "elevated" | "glass" | "minimal" | "bordered";
type LayoutStyle = "masonry" | "grid" | "list";
type AnimationStyle = "fade-up" | "fade-in" | "scale";

interface StyleConfig {
  card: CardStyle;
  layout: LayoutStyle;
  animation: AnimationStyle;
}

const STYLE_KEY = "qrmingle_reviews_style";

const defaultStyle: StyleConfig = { card: "elevated", layout: "masonry", animation: "fade-up" };

// ── Animated counter ──────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

// ── Scroll-triggered visibility ───────────────────────────────────────────────

function useInView(ref: React.RefObject<Element>, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

// ── Card style helpers ────────────────────────────────────────────────────────

function cardClass(style: CardStyle) {
  switch (style) {
    case "elevated": return "bg-white rounded-2xl shadow-lg border-0 p-5";
    case "glass":    return "bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-md p-5";
    case "minimal":  return "bg-transparent rounded-xl border border-slate-100 p-5";
    case "bordered": return "bg-white rounded-xl border-2 border-indigo-100 p-5";
  }
}

function animClass(style: AnimationStyle, inView: boolean, delay: number) {
  const base = "transition-all duration-700";
  const hidden = style === "fade-up"  ? "opacity-0 translate-y-6"
               : style === "scale"    ? "opacity-0 scale-95"
               :                        "opacity-0";
  const visible = style === "fade-up" ? "opacity-100 translate-y-0"
                : style === "scale"   ? "opacity-100 scale-100"
                :                       "opacity-100";
  return `${base} ${inView ? visible : hidden}`;
}

// ── Single review card ────────────────────────────────────────────────────────

function ReviewItem({ review, cardStyle, animStyle, index }: {
  review: Review; cardStyle: CardStyle; animStyle: AnimationStyle; index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref as React.RefObject<Element>);
  const delay = Math.min(index * 80, 400);

  const initials = review.name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
  const colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6"];
  const bg = colors[review.id % colors.length];

  return (
    <div
      ref={ref}
      className={`${cardClass(cardStyle)} ${animClass(animStyle, inView, delay)} break-inside-avoid mb-4`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: bg }}
        >
          {review.avatarUrl
            ? <img src={review.avatarUrl} alt={review.name} className="w-9 h-9 rounded-full object-cover" />
            : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 truncate">{review.name}</p>
          {review.title && <p className="text-xs text-slate-400 truncate">{review.title}</p>}
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < (review.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold text-white">
        {suffix === "%" ? `${animated}%` : suffix === "★" ? animated.toFixed(1) : animated}
      </span>
      <span className="text-sm text-indigo-200 mt-1">{label}</span>
    </div>
  );
}

// ── Style picker ──────────────────────────────────────────────────────────────

function StylePicker({ config, onChange }: { config: StyleConfig; onChange: (c: StyleConfig) => void }) {
  const [open, setOpen] = useState(false);

  const opt = <T extends string>(label: string, key: keyof StyleConfig, options: T[]) => (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onChange({ ...config, [key]: o })}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              config[key] === o
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-400"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:border-indigo-400 transition-all"
      >
        <Settings2 size={13} /> Style
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-64 flex flex-col gap-4">
          {opt("Card style", "card", ["elevated", "glass", "minimal", "bordered"] as CardStyle[])}
          {opt("Layout", "layout", ["masonry", "grid", "list"] as LayoutStyle[])}
          {opt("Animation", "animation", ["fade-up", "fade-in", "scale"] as AnimationStyle[])}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [style, setStyle] = useState<StyleConfig>(() => {
    try { return { ...defaultStyle, ...JSON.parse(localStorage.getItem(STYLE_KEY) || "{}") }; }
    catch { return defaultStyle; }
  });

  const { data: reviews = [], isLoading } = useQuery<Review[]>({ queryKey: ["/api/reviews"] });

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length
    : 0;
  const satisfaction = Math.round(
    (reviews.filter(r => (r.rating ?? 0) >= 4).length / Math.max(reviews.length, 1)) * 100
  );

  const saveStyle = (c: StyleConfig) => {
    setStyle(c);
    localStorage.setItem(STYLE_KEY, JSON.stringify(c));
  };

  const gridClass = style.layout === "masonry"
    ? "columns-1 sm:columns-2 lg:columns-3"
    : style.layout === "grid"
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    : "flex flex-col gap-4";

  return (
    <div className="max-w-5xl mx-auto">

      {/* Hero banner */}
      <div className="rounded-3xl mb-8 p-8 flex flex-col items-center text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)" }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <h1 className="text-3xl font-bold text-white mb-1 relative">What people say</h1>
        <p className="text-indigo-200 text-sm mb-8 relative">Real reviews from real QrMingle users</p>

        <div className="grid grid-cols-3 gap-8 w-full max-w-sm relative">
          <StatCard value={reviews.length} label="Reviews" />
          <StatCard value={parseFloat(avgRating.toFixed(1))} label="Avg Rating" suffix="★" />
          <StatCard value={satisfaction} label="Happy users" suffix="%" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <StylePicker config={style} onChange={saveStyle} />
          <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 h-8 text-xs px-3">
                <Plus size={13} /> Add Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Your Experience</DialogTitle>
                <DialogDescription>Tell others about your experience with QrMingle</DialogDescription>
              </DialogHeader>
              <ReviewSubmitForm onSuccess={() => setReviewFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reviews */}
      {isLoading ? (
        <div className="columns-1 sm:columns-2 lg:columns-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse bg-slate-100 rounded-2xl mb-4 break-inside-avoid" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className={gridClass}>
          {reviews.map((review, i) => (
            <ReviewItem key={review.id} review={review} cardStyle={style.card} animStyle={style.animation} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-3xl bg-slate-50 border border-slate-100">
          <div className="text-5xl mb-4">⭐</div>
          <p className="font-semibold text-slate-700 mb-1">No reviews yet</p>
          <p className="text-sm text-slate-400 mb-5">Be the first to share your experience!</p>
          <Button onClick={() => setReviewFormOpen(true)}>Add Review</Button>
        </div>
      )}
    </div>
  );
}
