"use client";

import { useRef, useState, useCallback } from "react";
import { ShieldCheck, Check } from "lucide-react";

// Premium hero visual: three real graded-slab cards fanned in 3D. As the cursor
// approaches the cluster, the cards spin centrifugally (outward from the center)
// and lift, a few degrees each, springing back smoothly on leave.
const CARDS = [
  { slug: "ripken", grade: "PSA 9", x: -132, y: 46, rot: -11, z: 10, dir: -1, w: 200 },
  { slug: "bojackson", grade: "PSA 9", x: 132, y: 58, rot: 10, z: 20, dir: 1, w: 200 },
  { slug: "griffey", grade: "PSA 8", x: 4, y: -6, rot: 3, z: 30, dir: 0.5, w: 232 },
];

export function HeroShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); // proximity 0..1

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.42;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    const thresh = Math.max(r.width, 460);
    setP(Math.max(0, Math.min(1, 1 - dist / thresh)));
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setP(0)}
      className="relative hidden h-[440px] lg:block"
      style={{ perspective: "1200px" }}
      aria-hidden
    >
      {/* Ambient glow that intensifies with proximity */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/30 blur-3xl transition-opacity duration-500"
        style={{ opacity: 0.35 + p * 0.4 }}
      />
      {CARDS.map((c) => {
        const spin = c.dir * p * 15; // centrifugal degrees
        const outX = c.dir * p * 52; // pushed outward
        const lift = -p * 24;
        return (
          <div
            key={c.slug}
            className="absolute left-1/2 top-1/2"
            style={{
              width: c.w,
              transform: `translate(-50%, -50%) translate(${c.x + outX}px, ${c.y + lift}px) rotate(${c.rot + spin}deg) scale(${1 + p * 0.05})`,
              zIndex: c.z,
              transition: "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <SlabCard slug={c.slug} grade={c.grade} />
          </div>
        );
      })}
    </div>
  );
}

function SlabCard({ slug, grade }: { slug: string; grade: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_30px_60px_-15px_rgb(2_19_94/0.7)] ring-1 ring-black/5">
      <div className="flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-white">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-400" strokeWidth={2.4} /> {grade}
        </span>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
        </span>
      </div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/cards/${slug}.jpg`} alt="" className="aspect-[3/4] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20" />
      </div>
    </div>
  );
}
