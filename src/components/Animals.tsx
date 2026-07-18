import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimalProps {
  type: "peacock" | "elephant";
}

export const Animals: React.FC<AnimalProps> = ({ type }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tailRef = useRef<SVGGElement>(null);
  const trunkRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const earRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (type === "peacock") {
      const tail = tailRef.current;
      if (!tail) return;

      // Start tail closed/small
      gsap.set(tail, { scaleScale: 0.5, scaleY: 0.3, opacity: 0.5, transformOrigin: "50px 80px" });

      // Flare open when scrolled into view
      const trigger = gsap.to(tail, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
          end: "bottom 40%",
          toggleActions: "play none none reverse",
        },
      });

      return () => {
        trigger.scrollTrigger?.kill();
        trigger.kill();
      };
    } else if (type === "elephant") {
      const trunk = trunkRef.current;
      const head = headRef.current;
      const ear = earRef.current;

      if (!trunk || !head || !ear) return;

      // Setup initial trunk rotation
      gsap.set(trunk, { rotation: 0, transformOrigin: "60px 45px" });

      // Trunk lifts when scrolled
      const trigger = gsap.to(trunk, {
        rotation: -25,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          end: "bottom 30%",
          toggleActions: "play none none reverse",
        },
      });

      // Subtle real-time idle animations
      // 1. Head bob
      const headAnim = gsap.to(head, {
        y: -3,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // 2. Ear flap
      const earAnim = gsap.to(ear, {
        scaleX: 0.8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        transformOrigin: "42px 35px",
      });

      return () => {
        trigger.scrollTrigger?.kill();
        trigger.kill();
        headAnim.kill();
        earAnim.kill();
      };
    }
  }, [type]);

  if (type === "peacock") {
    return (
      <div
        ref={containerRef}
        className="relative w-48 h-64 flex flex-col justify-end items-center pointer-events-none z-10"
      >
        <svg
          width="160"
          height="220"
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Peacock Tail Fan (flares on scroll) */}
          <g ref={tailRef}>
            {/* Feathers radiating */}
            {Array.from({ length: 9 }).map((_, idx) => {
              const angle = (idx - 4) * 20; // -80 to 80 deg
              return (
                <g key={idx} style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50px 80px" }}>
                  {/* Stem */}
                  <line x1="50" y1="80" x2="50" y2="20" stroke="#007f5f" strokeWidth="2" />
                  {/* Feather eye */}
                  <circle cx="50" cy="18" r="7" fill="#005f73" />
                  <circle cx="50" cy="18" r="4.5" fill="#e9d8a6" />
                  <circle cx="50" cy="18" r="2.5" fill="#0a9396" />
                </g>
              );
            })}
          </g>

          {/* Peacock Body & Column Platform */}
          {/* Column */}
          <rect x="35" y="95" width="30" height="25" fill="#c3c3c3" rx="2" />
          <rect x="32" y="92" width="36" height="4" fill="#a8a8a8" />
          {/* Legs */}
          <line x1="46" y1="82" x2="46" y2="92" stroke="#6d5939" strokeWidth="2" />
          <line x1="54" y1="82" x2="54" y2="92" stroke="#6d5939" strokeWidth="2" />
          {/* Body */}
          <path
            d="M38 65 C38 45, 52 40, 52 50 C52 55, 48 60, 48 65 C48 72, 58 78, 54 82 C50 85, 38 78, 38 65 Z"
            fill="#005f73"
          />
          {/* Head & Neck */}
          <path
            d="M52 50 C52 40, 58 35, 58 30 C58 27, 56 25, 53 25 C50 25, 48 28, 48 33 Z"
            fill="#005f73"
          />
          {/* Crest/Crown feathers */}
          <line x1="53" y1="25" x2="51" y2="18" stroke="#005f73" strokeWidth="1" />
          <line x1="53" y1="25" x2="53" y2="16" stroke="#005f73" strokeWidth="1" />
          <line x1="53" y1="25" x2="55" y2="18" stroke="#005f73" strokeWidth="1" />
          <circle cx="51" cy="17" r="1.5" fill="#ffd700" />
          <circle cx="53" cy="15" r="1.5" fill="#ffd700" />
          <circle cx="55" cy="17" r="1.5" fill="#ffd700" />
          
          {/* Eye & Beak */}
          <polygon points="58,30 63,31 58,33" fill="#e9d8a6" />
          <circle cx="56" cy="28" r="1" fill="#000" />
          
          {/* Wing (sways slightly in wind) */}
          <path
            d="M40 62 C42 56, 48 56, 48 66 C48 72, 42 74, 40 70 Z"
            fill="#0a9396"
            className="animate-sway-slow transform origin-top-left"
          />
        </svg>
      </div>
    );
  }

  // Elephant SVG
  return (
    <div
      ref={containerRef}
      className="relative w-56 h-64 flex flex-col justify-end items-center pointer-events-none z-10"
    >
      <svg
        width="200"
        height="200"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head and body group (bobs on idle) */}
        <g ref={headRef}>
          {/* Elephant Body */}
          <path
            d="M20 70 C20 40, 75 40, 85 55 C90 62, 90 75, 80 85 C75 90, 70 90, 68 85 H32 C30 90, 25 90, 20 85 C15 78, 20 70, 20 70 Z"
            fill="#8d99ae"
          />
          {/* Back Leg */}
          <rect x="25" y="80" width="12" height="25" fill="#758296" rx="3" />
          {/* Front Leg */}
          <rect x="68" y="80" width="12" height="25" fill="#758296" rx="3" />
          {/* Tail */}
          <path d="M22 68 C15 72, 16 85, 14 90" stroke="#758296" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="14" cy="91" r="2.5" fill="#3d405b" />

          {/* Decorative Rug (Howdah/Saddle) */}
          <path d="M38 52 C38 52, 55 46, 72 52 C74 65, 70 78, 62 82 C55 82, 40 78, 38 52 Z" fill="#d90429" />
          {/* Rug gold embroidery border */}
          <path d="M40 55 Q55 50, 70 55" stroke="#ffb703" strokeWidth="2" fill="none" />
          <circle cx="55" cy="68" r="6" fill="#ffb703" />
          <circle cx="55" cy="68" r="3" fill="#023e8a" />

          {/* Elephant Head */}
          <path
            d="M60 48 C60 30, 85 30, 92 42 C95 48, 92 60, 82 62 C78 62, 68 58, 60 48 Z"
            fill="#8d99ae"
          />

          {/* Elephant Trunk (moves on scroll) */}
          <g ref={trunkRef}>
            <path
              d="M86 52 C90 52, 98 48, 98 42 C98 34, 108 34, 108 42 C108 50, 98 62, 94 65 C92 66, 88 62, 86 52 Z"
              fill="#758296"
            />
            {/* Water/Hearts spray particles when raised */}
            <circle cx="112" cy="36" r="2" fill="#8ecae6" className="opacity-0 group-hover:opacity-100" />
            <circle cx="116" cy="30" r="1.5" fill="#8ecae6" className="opacity-0 group-hover:opacity-100" />
          </g>

          {/* Elephant Ear (flaps on idle) */}
          <g ref={earRef}>
            <path
              d="M58 40 C52 35, 42 35, 42 46 C42 54, 52 58, 58 50 Z"
              fill="#e63946"
            />
            {/* Ear inner detail */}
            <path
              d="M56 42 C51 38, 45 38, 45 46 C45 51, 52 54, 56 48 Z"
              fill="#ffb7a2"
            />
          </g>

          {/* Eye & Golden Tusk */}
          <circle cx="78" cy="40" r="1.5" fill="#000" />
          <path d="M84 48 C86 48, 94 48, 96 46 C92 50, 86 52, 82 50 Z" fill="#fff" />
        </g>
      </svg>
    </div>
  );
};
