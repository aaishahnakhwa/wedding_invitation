import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface PetalItem {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotateStart: number;
  swayWidth: number;
  color: string;
}

interface PetalShowerProps {
  primaryColor?: string;
  secondaryColor?: string;
  count?: number;
  active?: boolean;
}

export const PetalShower: React.FC<PetalShowerProps> = ({
  primaryColor = "#AE6FF1",
  secondaryColor = "#FFB7C5",
  count = 25,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const petalsRef = useRef<HTMLDivElement[]>([]);

  const petalColors = [
    "#f43f5e", // rose-500
    "#ec4899", // pink-500
    "#fda4af", // rose-300
    "#f472b6", // pink-400
    primaryColor,
    secondaryColor,
  ];

  const petals = useRef<PetalItem[]>(
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      size: Math.random() * 12 + 10, // pixels (10px to 22px)
      delay: Math.random() * -12, // staggered start
      duration: Math.random() * 6 + 5, // seconds (5s to 11s)
      rotateStart: Math.random() * 360,
      swayWidth: Math.random() * 30 + 15,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }))
  ).current;

  useEffect(() => {
    if (!active) return;

    let scrollTimeout: any;

    const handleScroll = () => {
      petalsRef.current.forEach((petal) => {
        if (!petal) return;
        gsap.to(petal, {
          skewX: -10,
          rotation: "+=15",
          x: "-=10",
          duration: 0.6,
          overwrite: "auto",
        });
      });

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        petalsRef.current.forEach((petal) => {
          if (!petal) return;
          gsap.to(petal, {
            skewX: 0,
            x: 0,
            duration: 1.2,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-25"
      style={{ height: "100%", width: "100%" }}
    >
      {petals.map((petal, index) => (
        <div
          key={petal.id}
          ref={(el) => {
            if (el) petalsRef.current[index] = el;
          }}
          className="absolute top-[-5%]"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            animation: `petal-fall-${petal.id} ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full opacity-75"
          >
            <path
              d="M12 2C8 2, 4 6, 4 11C4 17, 8 20, 12 22 C16 20, 20 17, 20 11 C20 6, 16 2, 12 2 Z"
              fill={petal.color}
            />
          </svg>

          <style>{`
            @keyframes petal-fall-${petal.id} {
              0% {
                transform: translateY(-20px) rotate(${petal.rotateStart}deg) translateX(0px);
              }
              50% {
                transform: translateY(50vh) rotate(${petal.rotateStart + 180}deg) translateX(${petal.swayWidth}px);
              }
              100% {
                transform: translateY(105vh) rotate(${petal.rotateStart + 360}deg) translateX(-${petal.swayWidth / 2}px);
              }
            }
          `}</style>
        </div>
      ))}
    </div>
  );
};
