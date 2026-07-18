import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface LeafItem {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  rotateStart: number;
  swayWidth: number;
  colorType: "primary" | "secondary" | "green";
}

interface FallingLeavesProps {
  primaryColor?: string;
  secondaryColor?: string;
  count?: number;
}

export const FallingLeaves: React.FC<FallingLeavesProps> = ({
  primaryColor = "#AE6FF1",
  secondaryColor = "#FFB7C5",
  count = 20,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leavesRef = useRef<HTMLDivElement[]>([]);

  // Generate a fixed array of leaf properties
  const leaves = useRef<LeafItem[]>(
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // percentage
      size: Math.random() * 16 + 12, // pixels (12px to 28px)
      delay: Math.random() * -10, // negative delay so they start scattered
      duration: Math.random() * 8 + 6, // seconds (6s to 14s)
      rotateStart: Math.random() * 360,
      swayWidth: Math.random() * 40 + 20, // horizontal sway range
      colorType: Math.random() > 0.6 ? "primary" : Math.random() > 0.4 ? "secondary" : "green",
    }))
  ).current;

  useEffect(() => {
    // Scroll-linked wind effect: when scrolling, we rotate and slide the leaves slightly
    let scrollTimeout: any;
    
    const handleScroll = () => {
      // Find all active leaves and apply a transient wind push
      leavesRef.current.forEach((leaf) => {
        if (!leaf) return;
        gsap.to(leaf, {
          skewX: 15,
          rotation: "+=12",
          x: "+=8",
          duration: 0.5,
          overwrite: "auto",
        });
      });

      // Settle down after scroll stops
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        leavesRef.current.forEach((leaf) => {
          if (!leaf) return;
          gsap.to(leaf, {
            skewX: 0,
            x: 0,
            duration: 1.5,
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
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-10"
      style={{ height: "100%", width: "100%" }}
    >
      {leaves.map((leaf, index) => {
        // Resolve leaf color
        let fill = "#84a98c"; // green
        if (leaf.colorType === "primary") fill = primaryColor;
        else if (leaf.colorType === "secondary") fill = secondaryColor;

        return (
          <div
            key={leaf.id}
            ref={(el) => {
              if (el) leavesRef.current[index] = el;
            }}
            className="absolute top-[-5%]"
            style={{
              left: `${leaf.left}%`,
              width: `${leaf.size}px`,
              height: `${leaf.size}px`,
              animation: `leaf-fall-${leaf.id} ${leaf.duration}s linear infinite`,
              animationDelay: `${leaf.delay}s`,
            }}
          >
            {/* Elegant organic leaf SVG */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full opacity-60"
            >
              <path
                d="M12 2C12 2 4 10 4 16C4 19.3137 6.68629 22 10 22C12.5 22 15 20.5 17 18.5C19.5 16 20 11 20 11C20 11 15 11.5 12.5 13.5C11 14.7 10 16 10 16C10 16 11 14 12 12.5C13.5 10.5 12 2 12 2Z"
                fill={fill}
              />
            </svg>

            {/* Custom keyframes per leaf to introduce unique horizontal sway widths */}
            <style>{`
              @keyframes leaf-fall-${leaf.id} {
                0% {
                  transform: translateY(-50px) rotate(${leaf.rotateStart}deg) translateX(0px);
                }
                50% {
                  transform: translateY(50vh) rotate(${leaf.rotateStart + 180}deg) translateX(${leaf.swayWidth}px);
                }
                100% {
                  transform: translateY(105vh) rotate(${leaf.rotateStart + 360}deg) translateX(-${leaf.swayWidth / 2}px);
                }
              }
            `}</style>
          </div>
        );
      })}
    </div>
  );
};
