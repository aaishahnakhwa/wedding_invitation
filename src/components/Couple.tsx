import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CoupleProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export const Couple: React.FC<CoupleProps> = ({
  primaryColor = "#AE6FF1",
  secondaryColor = "#FFB7C5",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const brideRef = useRef<HTMLDivElement>(null);
  const groomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bride = brideRef.current;
    const groom = groomRef.current;

    if (!bride || !groom) return;

    // Simulated inline animation for dashboard layout
    gsap.set(bride, { x: -45, y: 0, opacity: 1, scale: 1 });
    gsap.set(groom, { x: 45, y: 0, opacity: 1, scale: 1 });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-end justify-center select-none h-[300px] w-full max-w-md mx-auto"
    >
      {/* Decorative Aura / Glow behind the couple */}
      <div
        className="absolute w-64 h-64 rounded-full blur-3xl opacity-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10"
        style={{
          background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      />

      {/* 1. BRIDE LIVE FIGURE */}
      <div
        ref={brideRef}
        className="absolute bottom-0 left-[20%] transform origin-bottom animate-float-slow"
        style={{ animationDelay: "-1.5s" }}
      >
        <BrideSVG primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </div>

      {/* 2. GROOM LIVE FIGURE */}
      <div
        ref={groomRef}
        className="absolute bottom-0 right-[20%] transform origin-bottom animate-float-slow"
        style={{ animationDelay: "0s" }}
      >
        <GroomSVG primaryColor={primaryColor} secondaryColor={secondaryColor} />
      </div>

      {/* Platform Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-72 h-3 bg-black/10 blur-[3px] rounded-full -z-10" />
    </div>
  );
};

// ================= BRIDE LIVE SVG FIGURE =================
interface BrideProps {
  primaryColor: string;
  secondaryColor: string;
}

export const BrideSVG: React.FC<BrideProps> = ({ primaryColor, secondaryColor }) => {
  return (
    <svg
      width="145"
      height="250"
      viewBox="0 0 100 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
    >
      <style>{`
        .bride-head {
          animation: bride-head-nod 4s ease-in-out infinite alternate;
          transform-origin: 50px 75px;
        }
        .bride-body {
          animation: bride-breathe 2s ease-in-out infinite alternate;
          transform-origin: 50px 120px;
        }
        .bride-left-arm {
          animation: bride-arm-wave-l 3s ease-in-out infinite alternate;
          transform-origin: 32px 85px;
        }
        .bride-right-arm {
          animation: bride-arm-wave-r 3s ease-in-out infinite alternate;
          transform-origin: 68px 85px;
        }
        .bride-eye {
          animation: bride-blink 4s infinite;
          transform-origin: 43px 56px;
        }
        .bride-eye-r {
          animation: bride-blink 4s infinite;
          transform-origin: 57px 56px;
        }

        @keyframes bride-head-nod {
          0% { transform: rotate(-3deg); }
          100% { transform: rotate(3deg); }
        }
        @keyframes bride-breathe {
          0% { transform: scale(0.97, 0.97); }
          100% { transform: scale(1.02, 1.02); }
        }
        @keyframes bride-arm-wave-l {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
        @keyframes bride-arm-wave-r {
          0% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes bride-blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* HAIR BACK */}
      <path d="M28 38 C18 58, 22 82, 50 82 C78 82, 82 58, 72 38 Z" fill="#1e1b4b" />
      <circle cx="50" cy="82" r="14" fill="#1c1917" /> {/* Hair Bun */}
      {/* Decorative flowers in bun */}
      <circle cx="40" cy="85" r="4" fill={secondaryColor} />
      <circle cx="50" cy="90" r="5" fill="#facc15" />
      <circle cx="60" cy="85" r="4" fill={secondaryColor} />

      {/* BRIDE BODY (LEHENGA CHOLI) */}
      <g className="bride-body">
        {/* Lehenga Skirt */}
        <path
          d="M34 98 L18 160 C18 160, 50 168, 82 160 L66 98 Z"
          fill={primaryColor}
        />
        {/* Lehenga Gold Border and Embroidery details */}
        <path d="M18 155 Q50 163, 82 155" stroke="#facc15" strokeWidth="4" fill="none" />
        <path d="M20 145 Q50 152, 80 145" stroke="#eab308" strokeWidth="2.5" strokeDasharray="4 4" fill="none" />
        <path d="M22 135 Q50 142, 78 135" stroke="#ffd700" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
        
        {/* Blouse (Choli) */}
        <path d="M34 85 L66 85 L64 100 L36 100 Z" fill={primaryColor} />
        {/* Gold Border blouse */}
        <path d="M34 85 H66" stroke="#facc15" strokeWidth="2.5" />
        <path d="M36 100 H64" stroke="#facc15" strokeWidth="3" />

        {/* Waist Belt (Kamarbandh) */}
        <rect x="34" y="98" width="32" height="3.5" fill="#eab308" rx="1.5" />
        <circle cx="50" cy="100" r="3" fill="#ef4444" />
        <circle cx="42" cy="100" r="1.5" fill="#facc15" />
        <circle cx="58" cy="100" r="1.5" fill="#facc15" />

        {/* Neck (base layer for body) */}
        <rect x="46" y="70" width="8" height="15" fill="#fbcfe8" />
        {/* Gold Necklace (Haar) */}
        <path d="M42 78 Q50 86, 58 78" stroke="#facc15" strokeWidth="3" fill="none" />
        <path d="M40 82 Q50 90, 60 82" stroke="#eab308" strokeWidth="1.5" fill="none" />
        <circle cx="50" cy="85" r="2.5" fill="#ef4444" />
      </g>

      {/* LEFT ARM (Waves gently) */}
      <g className="bride-left-arm">
        <path d="M34 85 L26 98 L32 100 Z" fill={primaryColor} />
        <circle cx="29" cy="99" r="1.5" fill="#facc15" />
        <path d="M26 98 C23 108, 20 118, 24 122 C27 125, 30 118, 30 108 Z" fill="#fbcfe8" />
        {/* Henna detail on palm */}
        <circle cx="25" cy="114" r="2" fill="#991b1b" />
        {/* Bangles */}
        <path d="M27 103 L31 104" stroke="#facc15" strokeWidth="2.5" />
        <path d="M26 106 L30 107" stroke={secondaryColor} strokeWidth="2" />
      </g>

      {/* RIGHT ARM (Waves gently) */}
      <g className="bride-right-arm">
        <path d="M66 85 L74 98 L68 100 Z" fill={primaryColor} />
        <circle cx="71" cy="99" r="1.5" fill="#facc15" />
        <path d="M74 98 C77 108, 80 118, 76 122 C73 125, 70 118, 70 108 Z" fill="#fbcfe8" />
        {/* Henna detail on palm */}
        <circle cx="75" cy="114" r="2" fill="#991b1b" />
        {/* Bangles */}
        <path d="M73 103 L69 104" stroke="#facc15" strokeWidth="2.5" />
        <path d="M74 106 L70 107" stroke={secondaryColor} strokeWidth="2" />
      </g>

      {/* HEAD GROUP (Tilted/Nodding) */}
      <g className="bride-head">
        {/* Face */}
        <path
          d="M34 54 C34 38, 66 38, 66 54 C66 68, 60 76, 50 76 C40 76, 34 68, 34 54 Z"
          fill="#ffe4e6"
        />
        
        {/* Hair Front Frame */}
        <path d="M34 50 C40 42, 50 45, 50 48 C50 45, 60 42, 66 50 C66 42, 60 38, 50 38 C40 38, 34 42, 34 50 Z" fill="#1c1917" />
        {/* Red Bindi */}
        <circle cx="50" cy="48" r="2.5" fill="#ef4444" />
        {/* Gold Maang Tikka */}
        <line x1="50" y1="38" x2="50" y2="45" stroke="#facc15" strokeWidth="2" />
        <circle cx="50" cy="45" r="2" fill="#facc15" />

        {/* Eyes (Blinking in real-time) */}
        <ellipse cx="43" cy="56" rx="2.5" ry="2" fill="#111827" className="bride-eye" />
        <circle cx="44" cy="55" r="0.75" fill="#fff" className="bride-eye" />
        <path d="M39 54 Q41 53, 43 55" stroke="#111827" strokeWidth="1" fill="none" />
        
        <ellipse cx="57" cy="56" rx="2.5" ry="2" fill="#111827" className="bride-eye-r" />
        <circle cx="58" cy="55" r="0.75" fill="#fff" className="bride-eye-r" />
        <path d="M61 54 Q59 53, 57 55" stroke="#111827" strokeWidth="1" fill="none" />

        {/* Nose & Golden Nose Ring (Nath) */}
        <path d="M49 58 L50 61 L51 58" stroke="#d97706" strokeWidth="1" fill="none" />
        <circle cx="46" cy="62" r="4" stroke="#facc15" strokeWidth="1.2" fill="none" />
        <circle cx="43.5" cy="62" r="1" fill="#ef4444" />

        {/* Smile */}
        <path d="M44 66 Q50 71, 56 66" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        
        {/* Blush */}
        <circle cx="39" cy="63" r="3.5" fill="#f43f5e" fillOpacity="0.3" />
        <circle cx="61" cy="63" r="3.5" fill="#f43f5e" fillOpacity="0.3" />

        {/* Dupatta/Veil draped around head */}
        <path
          d="M34 43 C26 50, 18 70, 22 95 C26 92, 32 88, 34 85 C32 75, 34 43, 34 43 Z"
          fill={secondaryColor}
          fillOpacity="0.9"
        />
        <path
          d="M66 43 C74 50, 82 70, 78 95 C74 92, 68 88, 66 85 C68 75, 66 43, 66 43 Z"
          fill={secondaryColor}
          fillOpacity="0.9"
        />
        <path d="M34 43 C26 50, 18 70, 22 95" stroke="#facc15" strokeWidth="2" fill="none" />
        <path d="M66 43 C74 50, 82 70, 78 95" stroke="#facc15" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
};

// ================= GROOM LIVE SVG FIGURE =================
interface GroomProps {
  primaryColor: string;
  secondaryColor: string;
}

export const GroomSVG: React.FC<GroomProps> = ({ primaryColor, secondaryColor }) => {
  return (
    <svg
      width="145"
      height="250"
      viewBox="0 0 100 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
    >
      <style>{`
        .groom-head {
          animation: groom-head-nod 4.5s ease-in-out infinite alternate;
          transform-origin: 50px 75px;
        }
        .groom-body {
          animation: groom-breathe 2.2s ease-in-out infinite alternate;
          transform-origin: 50px 120px;
        }
        .groom-left-arm {
          animation: groom-arm-wave-l 3.2s ease-in-out infinite alternate;
          transform-origin: 32px 85px;
        }
        .groom-right-arm {
          animation: groom-arm-wave-r 3.2s ease-in-out infinite alternate;
          transform-origin: 68px 85px;
        }
        .groom-eye {
          animation: groom-blink 4.5s infinite;
          transform-origin: 43px 56px;
        }
        .groom-eye-r {
          animation: groom-blink 4.5s infinite;
          transform-origin: 57px 56px;
        }

        @keyframes groom-head-nod {
          0% { transform: rotate(3deg); }
          100% { transform: rotate(-3deg); }
        }
        @keyframes groom-breathe {
          0% { transform: scale(0.98, 0.98); }
          100% { transform: scale(1.03, 1.03); }
        }
        @keyframes groom-arm-wave-l {
          0% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
        @keyframes groom-arm-wave-r {
          0% { transform: rotate(-5deg); }
          100% { transform: rotate(5deg); }
        }
        @keyframes groom-blink {
          0%, 95%, 100% { transform: scaleY(1); }
          97.5% { transform: scaleY(0.1); }
        }
      `}</style>

      {/* HAIR BACK */}
      <path d="M34 45 C34 45, 50 40, 66 45 V55 H34 Z" fill="#1c1917" />

      {/* GROOM BODY (SHERWANI) */}
      <g className="groom-body">
        {/* Sherwani Coat */}
        <path
          d="M32 85 C32 85, 30 115, 25 160 L75 160 C70 115, 68 85, 68 85 Z"
          fill="#fafaf9" // Cream Sherwani base
        />
        {/* Sherwani center opening line */}
        <line x1="50" y1="85" x2="50" y2="160" stroke={primaryColor} strokeWidth="3" />
        {/* Gold buttons */}
        {[95, 107, 119, 131, 143].map((y) => (
          <circle key={y} cx="50" cy={y} r="2" fill="#eab308" />
        ))}
        {/* Neck */}
        <rect x="46" y="70" width="8" height="15" fill="#ffe4e6" />
        {/* Sherwani High Collar */}
        <path d="M42 80 Q50 78, 58 80 L58 85 Q50 83, 42 85 Z" fill={primaryColor} />
        <path d="M42 80 Q50 78, 58 80" stroke="#facc15" strokeWidth="1" />

        {/* Traditional Red Stole / Dupatta (draped over shoulder) */}
        <path
          d="M32 85 C32 85, 35 110, 31 160 H39 C42 125, 41 95, 41 85 Z"
          fill={secondaryColor}
        />
        <path d="M31 160 H39" stroke="#facc15" strokeWidth="2.5" />
      </g>

      {/* LEFT ARM */}
      <g className="groom-left-arm">
        <path d="M32 85 L26 110 H32 L35 95 Z" fill="#fafaf9" />
        <path d="M26 110 H32" stroke={primaryColor} strokeWidth="2.5" />
        <path d="M26 110 C24 118, 22 124, 25 127 C28 130, 31 124, 30 110 Z" fill="#ffe4e6" />
      </g>

      {/* RIGHT ARM */}
      <g className="groom-right-arm">
        <path d="M68 85 L74 110 H68 L65 95 Z" fill="#fafaf9" />
        <path d="M74 110 H68" stroke={primaryColor} strokeWidth="2.5" />
        <path d="M74 110 C76 118, 78 124, 75 127 C72 130, 69 124, 70 110 Z" fill="#ffe4e6" />
      </g>

      {/* GROOM HEAD GROUP */}
      <g className="groom-head">
        {/* Face */}
        <path
          d="M35 54 C35 38, 65 38, 65 54 C65 67, 59 75, 50 75 C41 75, 35 67, 35 54 Z"
          fill="#ffe4e6"
        />

        {/* Groom Beard & Mustache */}
        <path d="M35 58 C35 70, 42 75, 50 75 C58 75, 65 70, 65 58 C63 65, 58 70, 50 70 C42 70, 37 65, 35 58 Z" fill="#292524" />
        <path d="M42 64 Q50 61, 58 64 Q50 67, 42 64" fill="#292524" />

        {/* Eyes */}
        <ellipse cx="43" cy="55" rx="2.5" ry="2" fill="#111827" className="groom-eye" />
        <circle cx="44" cy="54" r="0.75" fill="#fff" className="groom-eye" />
        <path d="M39 53 Q41 52, 43 54" stroke="#111827" strokeWidth="1" fill="none" />

        <ellipse cx="57" cy="55" rx="2.5" ry="2" fill="#111827" className="groom-eye-r" />
        <circle cx="58" cy="54" r="0.75" fill="#fff" className="groom-eye-r" />
        <path d="M61 53 Q59 52, 57 54" stroke="#111827" strokeWidth="1" fill="none" />

        {/* Smile */}
        <path d="M45 65 Q50 69, 55 65" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Traditional Turban (Safaa) */}
        <path
          d="M32 45 C32 30, 68 30, 68 45 C60 38, 40 38, 32 45 Z"
          fill={primaryColor}
        />
        <path d="M32 45 Q50 35, 68 45" stroke="#facc15" strokeWidth="2" fill="none" />
        <path d="M33 41 Q50 32, 67 41" stroke="#facc15" strokeWidth="1.5" fill="none" />
        
        {/* Golden Kalgi/Feather ornament */}
        <path d="M50 32 Q50 17, 55 11 Q47 17, 50 32" fill={secondaryColor} />
        <line x1="50" y1="32" x2="50" y2="11" stroke="#facc15" strokeWidth="2" />
        <circle cx="50" cy="32" r="4" fill="#facc15" />
        <circle cx="50" cy="32" r="1.5" fill="#ef4444" />
      </g>
    </svg>
  );
};
