import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const FlyingBirds: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bird1Ref = useRef<HTMLDivElement>(null);
  const bird2Ref = useRef<HTMLDivElement>(null);
  const bird3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Bird 1: Foreground, fast flight
    const scroll1 = gsap.fromTo(
      bird1Ref.current,
      { x: "-20vw", y: "15vh", scale: 0.9, opacity: 0.9 },
      {
        x: "110vw",
        y: "5vh",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      }
    );

    // Bird 2: Midground, medium flight, diagonal upward path
    const scroll2 = gsap.fromTo(
      bird2Ref.current,
      { x: "-15vw", y: "30vh", scale: 0.6, opacity: 0.7 },
      {
        x: "115vw",
        y: "10vh",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 2,
        },
      }
    );

    // Bird 3: Background, slow flight, slight curve
    const scroll3 = gsap.fromTo(
      bird3Ref.current,
      { x: "110vw", y: "40vh", scale: 0.4, opacity: 0.5 }, // Flies right-to-left
      {
        x: "-20vw",
        y: "25vh",
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 3,
        },
      }
    );

    return () => {
      scroll1.scrollTrigger?.kill();
      scroll1.kill();
      scroll2.scrollTrigger?.kill();
      scroll2.kill();
      scroll3.scrollTrigger?.kill();
      scroll3.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-20"
      style={{ height: "100%", width: "100%" }}
    >
      {/* Bird 1: Foreground */}
      <div ref={bird1Ref} className="absolute top-0 left-0">
        <BirdSVG color="#4b3b5c" speed="0.6s" />
      </div>

      {/* Bird 2: Midground */}
      <div ref={bird2Ref} className="absolute top-0 left-0">
        <BirdSVG color="#6b5380" speed="0.8s" />
      </div>

      {/* Bird 3: Background (flies reverse) */}
      <div ref={bird3Ref} className="absolute top-0 left-0">
        {/* Flip horizontally since it flies from right to left */}
        <div className="scale-x-[-1]">
          <BirdSVG color="#82669a" speed="1.2s" />
        </div>
      </div>
    </div>
  );
};

interface BirdSVGProps {
  color: string;
  speed: string;
}

const BirdSVG: React.FC<BirdSVGProps> = ({ color, speed }) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      {/* Left Wing */}
      <path
        d="M32 28 C24 12, 12 12, 4 20 C12 28, 24 28, 32 28 Z"
        fill={color}
        style={{
          transformOrigin: "32px 28px",
          animation: `wing-flap ${speed} ease-in-out infinite`,
        }}
      />
      {/* Right Wing */}
      <path
        d="M32 28 C40 12, 52 12, 60 20 C52 28, 40 28, 32 28 Z"
        fill={color}
        style={{
          transformOrigin: "32px 28px",
          animation: `wing-flap ${speed} ease-in-out infinite`,
        }}
      />
      {/* Body */}
      <path
        d="M26 28 C28 26, 36 26, 38 28 C40 32, 34 38, 32 42 C30 38, 24 32, 26 28 Z"
        fill={color}
      />
      
      {/* Embed local wing-flap style */}
      <style>{`
        @keyframes wing-flap {
          0%, 100% {
            transform: scaleY(1) rotate(0deg);
          }
          50% {
            transform: scaleY(-0.3) rotate(-10deg);
          }
        }
      `}</style>
    </svg>
  );
};
