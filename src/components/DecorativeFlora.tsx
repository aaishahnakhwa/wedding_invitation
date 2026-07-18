import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FloraProps {
  primaryColor?: string;
  secondaryColor?: string;
  type: "top-garland" | "corner-blooms" | "pollen-particles";
}

export const DecorativeFlora: React.FC<FloraProps> = ({
  primaryColor = "#AE6FF1",
  secondaryColor = "#FFB7C5",
  type,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (type !== "corner-blooms") return;

    // Scroll-triggered bloom for flowers
    const elements = elementsRef.current;
    if (elements.length === 0) return;

    gsap.set(elements, { scale: 0, opacity: 0, transformOrigin: "bottom left" });

    const trigger = gsap.to(elements, {
      scale: 1,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: "elastic.out(1, 0.6)",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        end: "bottom 50%",
        toggleActions: "play none none reverse",
      },
    });

    return () => {
      trigger.scrollTrigger?.kill();
      trigger.kill();
    };
  }, [type]);

  if (type === "top-garland") {
    return (
      <div
        ref={containerRef}
        className="absolute top-0 inset-x-0 h-40 pointer-events-none overflow-hidden z-20 flex justify-around items-start"
      >
        {/* Render 3 beautiful hanging garlands that sway in real-time */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-sway-slow transform origin-top drop-shadow-lg"
            style={{
              animationDelay: `${i * -1.8}s`,
              animationDuration: `${5 + i}s`,
            }}
          >
            <svg
              width="120"
              height="200"
              viewBox="0 0 100 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* String line */}
              <line x1="50" y1="0" x2="50" y2="180" stroke="#7d6a45" strokeWidth="2" strokeDasharray="3 3" />
              {/* Floral beads hanging */}
              {[20, 50, 80, 110, 140, 170].map((y, idx) => {
                const isEven = idx % 2 === 0;
                const r = isEven ? 10 : 8;
                const fill = isEven ? primaryColor : secondaryColor;
                return (
                  <g key={y}>
                    {/* Flower shape */}
                    <circle cx="50" cy={y} r={r} fill={fill} />
                    <circle cx="50" cy={y} r={r/2} fill="#ffeb99" />
                    {/* Tiny leaf */}
                    <path
                      d={`M50 ${y} Q${isEven ? 65 : 35} ${y - 10}, 50 ${y - 15}`}
                      fill="#7a9a60"
                    />
                  </g>
                );
              })}
              {/* Hanging golden bell at the bottom */}
              <path
                d="M44 175 H56 L58 190 H42 Z"
                fill="#ffd700"
                stroke="#b59a00"
                strokeWidth="1"
              />
              <circle cx="50" cy="192" r="3" fill="#b59a00" />
            </svg>
          </div>
        ))}
      </div>
    );
  }

  if (type === "corner-blooms") {
    return (
      <div
        ref={containerRef}
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none overflow-hidden z-20"
      >
        {/* Flower 1 */}
        <div
          ref={(el) => { if (el) elementsRef.current[0] = el; }}
          className="absolute bottom-0 left-0 origin-bottom-left"
        >
          <FlowerSVG color={primaryColor} size={140} />
        </div>
        {/* Flower 2 */}
        <div
          ref={(el) => { if (el) elementsRef.current[1] = el; }}
          className="absolute bottom-8 left-16 origin-bottom-left"
        >
          <FlowerSVG color={secondaryColor} size={100} />
        </div>
        {/* Flower 3 */}
        <div
          ref={(el) => { if (el) elementsRef.current[2] = el; }}
          className="absolute bottom-20 left-2 origin-bottom-left"
        >
          <FlowerSVG color="#ffeb99" size={80} />
        </div>
        {/* Leaves swaying */}
        <div
          ref={(el) => { if (el) elementsRef.current[3] = el; }}
          className="absolute bottom-4 left-32 origin-bottom-left animate-sway-slow"
        >
          <LeafSVG color="#82a36f" size={70} />
        </div>
      </div>
    );
  }

  // Pollen/floating light particles
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      {Array.from({ length: 12 }).map((_, i) => {
        const size = Math.random() * 6 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * -10;
        const duration = Math.random() * 6 + 6;
        return (
          <div
            key={i}
            className="absolute rounded-full opacity-35"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              bottom: "-5%",
              backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
              boxShadow: `0 0 10px ${i % 2 === 0 ? primaryColor : secondaryColor}`,
              animation: `pollen-float-${i} ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      <style>{
        Array.from({ length: 12 }).map((_, i) => `
          @keyframes pollen-float-${i} {
            0% {
              transform: translateY(0px) translateX(0px);
              opacity: 0;
            }
            10% { opacity: 0.4; }
            90% { opacity: 0.4; }
            100% {
              transform: translateY(-90vh) translateX(${Math.random() * 60 - 30}px);
              opacity: 0;
            }
          }
        `).join("\n")
      }</style>
    </div>
  );
};

// Flower SVG Generator
const FlowerSVG: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      {/* Petals */}
      <circle cx="50" cy="30" r="18" fill={color} />
      <circle cx="50" cy="70" r="18" fill={color} />
      <circle cx="30" cy="50" r="18" fill={color} />
      <circle cx="70" cy="50" r="18" fill={color} />
      <circle cx="36" cy="36" r="18" fill={color} />
      <circle cx="64" cy="64" r="18" fill={color} />
      <circle cx="36" cy="64" r="18" fill={color} />
      <circle cx="64" cy="36" r="18" fill={color} />
      {/* Center */}
      <circle cx="50" cy="50" r="15" fill="#ffd700" />
      <circle cx="50" cy="50" r="8" fill="#e5c100" />
    </svg>
  );
};

// Leaf SVG Generator
const LeafSVG: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 90 C30 50, 70 30, 90 20 C80 60, 40 80, 20 90 Z"
        fill={color}
        stroke="#5d784e"
        strokeWidth="2"
      />
      {/* Veins */}
      <path d="M20 90 C35 70, 55 50, 90 20" stroke="#5d784e" strokeWidth="2" />
      <path d="M40 73 C46 62, 54 58, 54 58" stroke="#5d784e" strokeWidth="1.5" />
      <path d="M60 55 C68 46, 75 42, 75 42" stroke="#5d784e" strokeWidth="1.5" />
    </svg>
  );
};
