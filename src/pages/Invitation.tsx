import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Calendar, MapPin, Phone, ArrowLeft, Heart, X, Clock, Mail, ChevronDown } from "lucide-react";
import { BrideSVG, GroomSVG } from "../components/Couple";
import { FallingLeaves } from "../components/FallingLeaves";
import { DecorativeFlora } from "../components/DecorativeFlora";
import { Animals } from "../components/Animals";
import { YoutubeAudioPlayer } from "../components/YoutubeAudioPlayer";
import { PetalShower } from "../components/PetalShower";
import { getInvitation, decodeInvitationData, type InvitationData } from "../firebase";

gsap.registerPlugin(ScrollTrigger);

interface InvitationProps {
  previewData?: InvitationData; // Used for live preview in Dashboard
}

export const Invitation: React.FC<InvitationProps> = ({ previewData }) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction & Autoplay State
  const [isOpened, setIsOpened] = useState(!!previewData); // Bypass overlay in dashboard preview
  const [audioTriggered, setAudioTriggered] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // Details modal

  // RSVP Form State
  const [rsvpStatus, setRsvpStatus] = useState<"pending" | "yes" | "no">("pending");
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Refs for unified scroll gate/couple meet timeline
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const stickyContentRef = useRef<HTMLDivElement>(null);
  const gateLeftRef = useRef<HTMLDivElement>(null);
  const gateRightRef = useRef<HTMLDivElement>(null);
  const brideRef = useRef<HTMLDivElement>(null);
  const groomRef = useRef<HTMLDivElement>(null);
  const coupleAuraRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);
  const petalRef = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const overlayBirdsRef = useRef<HTMLDivElement>(null);

  // Fetch Invitation Data
  useEffect(() => {
    if (previewData) {
      setData(previewData);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      // 1. Try URL parameters data query
      const urlData = searchParams.get("data");
      if (urlData) {
        const decoded = decodeInvitationData(urlData);
        if (decoded) {
          setData(decoded);
          setLoading(false);
          return;
        }
      }

      // 2. Try Firebase ID in route path
      if (id) {
        try {
          const docData = await getInvitation(id);
          if (docData) {
            setData(docData);
          } else {
            setError("Invitation not found. Please verify the link.");
          }
        } catch (e) {
          setError("Failed to fetch invitation details.");
        }
      } else {
        // Fallback demo defaults
        setData({
          brideName: "Ananya",
          groomName: "Rahul",
          weddingDate: "2025-11-24",
          venue: "The Royal Garden Palace, Udaipur",
          additionalDetails: "RSVP: +91 98765 43210",
          primaryColor: "#AE6FF1",
          secondaryColor: "#FFB7C5",
          gradientStart: "#FFF1EB",
          gradientEnd: "#ACE0F9",
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          events: [
            {
              id: "1",
              name: "Haldi Ceremony",
              date: "2025-11-22",
              time: "11:00 AM",
              icon: "✨",
              subtext: "Click for more details on dress code",
              extraDetails: "Dress Code: Bright Yellow. Join us for a lively morning filled with traditional music, marigold flowers, and finger-licking buffet lunch.",
            },
            {
              id: "2",
              name: "Mehendi & Sangeet",
              date: "2025-11-23",
              time: "05:00 PM",
              icon: "🎶",
              subtext: "Click for details on theme & timing",
              extraDetails: "Dress Code: Shades of Green. Kick back with henna artists, enjoy family dance-offs, and tuck into street food counters and cocktails.",
            },
            {
              id: "3",
              name: "Wedding",
              date: "2025-11-24",
              time: "10:30 AM",
              icon: "💍",
              subtext: "Click for Muhurtham details",
              extraDetails: "Dress Code: Traditional Royalty. Main wedding vows and garland exchange. High-tea will be served throughout followed by a grand royal feast.",
            },
            {
              id: "4",
              name: "Reception",
              date: "2025-11-25",
              time: "07:30 PM",
              icon: "🥂",
              subtext: "Click for reception venue details",
              extraDetails: "Dress Code: Indo-Western or Formals. Share a glass of champagne with us, cut the cake, and dance the night away to our live band.",
            },
          ]
        });
      }
      setLoading(false);
    };

    loadData();
  }, [id, searchParams, previewData]);

  // Set up GSAP scroll pinning and Lenis smooth scrolling
  useEffect(() => {
    if (loading || !data || !isOpened) return; // Disable scroll until Wax Seal is opened

    // A. Live preview layout animations (simplified timeline, non-pinning)
    if (previewData) {
      gsap.set(gateLeftRef.current, { rotationY: -105, transformOrigin: "left center" });
      gsap.set(gateRightRef.current, { rotationY: 105, transformOrigin: "right center" });
      gsap.set(brideRef.current, { x: "-45px" });
      gsap.set(groomRef.current, { x: "45px" });
      gsap.set(namesRef.current, { opacity: 1, scale: 1 });
      gsap.set(petalRef.current, { opacity: 0.8 });
      gsap.set(coupleAuraRef.current, { opacity: 0.25 });
      return;
    }

    // B. Full screen scroll timeline (Full-screen viewport)
    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Set up initial timeline values
    gsap.set(gateLeftRef.current, { rotationY: 0, transformOrigin: "left center" });
    gsap.set(gateRightRef.current, { rotationY: 0, transformOrigin: "right center" });
    gsap.set(brideRef.current, { x: "-60vw", y: 15, scale: 0.95 });
    gsap.set(groomRef.current, { x: "60vw", y: 15, scale: 0.95 });
    gsap.set(namesRef.current, { opacity: 0, scale: 0.8, y: 10 });
    gsap.set(coupleAuraRef.current, { opacity: 0 });
    gsap.set(overlayBirdsRef.current, { x: "-20vw", y: "-5vh", opacity: 0 });

    // 3. Create scrubbing animation timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinContainerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    tl
      // Step A: Swing open gates and fade scroll indicator
      .to(scrollPromptRef.current, { opacity: 0, y: -20, duration: 0.1 }, 0)
      .to(gateLeftRef.current, { rotationY: -105, ease: "power1.inOut" }, 0.1)
      .to(gateRightRef.current, { rotationY: 105, ease: "power1.inOut" }, 0.1)

      // Step B: Slide Couple in from opposite sides to meet side-by-side (NO overlap)
      .to(brideRef.current, { x: "-45px", ease: "power2.out" }, 0.2)
      .to(groomRef.current, { x: "45px", ease: "power2.out" }, 0.2)
      .to(coupleAuraRef.current, { opacity: 0.25, ease: "power2.out" }, 0.3)

      // Step C: Fade in names & trigger flock of overlay birds
      .to(namesRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.2)" }, 0.4)
      
      // Step D: Flock of birds fly directly over couple
      .to(overlayBirdsRef.current, { opacity: 1, x: "120vw", y: "-15vh", duration: 0.6, ease: "none" }, 0.3);

    // 4. Staggered reveal for event cards
    const cards = gsap.utils.toArray(".event-card");
    cards.forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [loading, data, isOpened, previewData]);

  // Handler to open invitation and start audio safely
  const handleOpenInvitation = () => {
    setIsOpened(true);
    setAudioTriggered(true);
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-purple-500 animate-spin" />
        <span className="text-gray-400 font-medium text-sm font-sans">Preparing details of love...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-md">
          <p className="text-red-400 font-semibold">{error || "Something went wrong loading the invite."}</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    );
  }

  // Format styles
  const textGradient = {
    background: `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const bgGradient = {
    background: `linear-gradient(180deg, ${data.gradientStart} 0%, ${data.gradientEnd} 100%)`,
  };

  const activeEvents = data.events || [];

  return (
    <div
      className={`relative w-full min-h-screen ${previewData ? "h-[600px] overflow-y-auto" : ""}`}
      style={bgGradient}
    >
      {/* Global falling petals layer - flows throughout the whole page till the end */}
      {isOpened && (
        <div className={`${previewData ? "absolute" : "fixed"} inset-0 pointer-events-none z-40 overflow-hidden`}>
          <PetalShower
            primaryColor={data.primaryColor}
            secondaryColor={data.secondaryColor}
            count={previewData ? 8 : 25}
            active={true}
          />
        </div>
      )}

      {/* ================= OPT IN ENVELOPE WAX SEAL OVERLAY (Autoplay Bypass) ================= */}
      {!isOpened && (
        <div className="fixed inset-0 bg-[#0d0c15] z-50 flex items-center justify-center p-6 select-none">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: "radial-gradient(circle at center, #6b21a8 0%, transparent 70%)",
            }}
          />
          {/* wax envelope card */}
          <div className="relative max-w-sm w-full bg-[#1b1929] border border-yellow-500/20 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center gap-6 transform scale-100 hover:scale-[1.01] transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-inner">
              <Mail className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-[0.25em]">Wedding Invitation</span>
              <h2 className="text-3xl font-serif text-gray-100 font-bold">
                {data.brideName} & {data.groomName}
              </h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed px-4 pt-1">
                You are cordially invited to celebrate our beautiful moments of love and union.
              </p>
            </div>

            <button
              onClick={handleOpenInvitation}
              className="mt-4 px-8 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-purple-950 font-black tracking-wider text-xs shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 active:scale-95 transition-all animate-pulse duration-1000 flex items-center gap-2"
            >
              ✉️ Open Invitation
            </button>
          </div>
        </div>
      )}

      {/* Background Pollen Particles */}
      <DecorativeFlora type="pollen-particles" primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />

      {/* Falling Leaves (Global background layer) */}
      {!previewData && isOpened && (
        <FallingLeaves
          primaryColor={data.primaryColor}
          secondaryColor={data.secondaryColor}
          count={10}
        />
      )}

      {/* ================= UNIFIED SCENE 1 & 2: GATES + COUPLE MEETING (PINNED) ================= */}
      {previewData ? (
        /* SIMPLE SIMULATED PREVIEW IN DASHBOARD PHONE FRAME */
        <section className="relative h-[480px] flex flex-col justify-center items-center px-4 py-8 select-none overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-24 overflow-hidden pointer-events-none">
            <DecorativeFlora type="top-garland" primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />
          </div>

          <div className="text-center z-20 flex flex-col items-center mt-6 w-full">
            <span className="text-[9px] font-bold tracking-[0.15em] text-gray-500 uppercase block mb-1">
              Save the Date Invitation
            </span>
            <h1 className="text-2xl font-serif font-black tracking-wide py-1 text-center" style={textGradient}>
              {data.brideName} & {data.groomName}
            </h1>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Together with their families</p>
          </div>

          {/* Simple side-by-side couple representation (NO overlap) */}
          <div className="relative flex items-end justify-center gap-2 mt-4 h-[160px] w-full scale-75 origin-bottom">
            <div className="transform -translate-x-[22px]">
              <BrideSVG primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />
            </div>
            <div className="transform translate-x-[22px]">
              <GroomSVG primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />
            </div>
          </div>
        </section>
      ) : (
        /* HIGH END SCROLL PINNED INTERACTION FOR INVITE PAGE */
        isOpened && (
          <div ref={pinContainerRef} className="relative w-full h-[200vh] z-30 select-none overflow-hidden">
            <div
              ref={stickyContentRef}
              className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden perspective-[1200px]"
            >
              {/* Hanging garlands at the top */}
              <DecorativeFlora type="top-garland" primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />

              {/* Background elements */}
              <div className="absolute inset-0 z-0 overflow-hidden opacity-10 flex items-center justify-center">
                <img src="/palace.png" alt="Palace" className="w-full h-full object-cover mix-blend-overlay" />
              </div>

              {/* COUPLE CONTAINER (Slide-in Meet synchronized to scroll) */}
              <div className="relative flex items-end justify-center w-full max-w-lg h-[280px] md:h-[320px] mt-10 z-10">
                
                {/* Couple Glow Aura */}
                <div
                  ref={coupleAuraRef}
                  className="absolute w-60 h-60 rounded-full blur-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 transition-opacity"
                  style={{
                    background: `radial-gradient(circle, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`,
                  }}
                />

                {/* Bride Wrapper (Slides left-to-center via GSAP) */}
                <div
                  ref={brideRef}
                  className="absolute bottom-0"
                >
                  <div className="transform origin-bottom animate-float-slow" style={{ animationDelay: "-1.5s" }}>
                    <BrideSVG primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />
                  </div>
                </div>

                {/* Groom Wrapper (Slides right-to-center via GSAP) */}
                <div
                  ref={groomRef}
                  className="absolute bottom-0"
                >
                  <div className="transform origin-bottom animate-float-slow" style={{ animationDelay: "0s" }}>
                    <GroomSVG primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />
                  </div>
                </div>
              </div>

              {/* Couple names (Fades in as they meet) */}
              <div ref={namesRef} className="text-center z-20 mt-4 px-6">
                <span className="text-[10px] font-bold tracking-[0.2em] text-gray-700 uppercase block mb-1">
                  We invite you to celebrate the wedding of
                </span>
                <h1 className="text-4xl md:text-6xl font-serif font-black tracking-wide" style={textGradient}>
                  {data.brideName} & {data.groomName}
                </h1>
                <p className="text-xs text-gray-500 font-medium tracking-wide mt-1">Together with their families</p>
              </div>

              {/* Scroll-linked flying birds flock */}
              <div ref={overlayBirdsRef} className="absolute top-1/4 pointer-events-none z-20">
                <svg width="60" height="40" viewBox="0 0 64 64" fill="none">
                  <path d="M32 28 C24 12, 12 12, 4 20 C12 28, 24 28, 32 28 Z" fill="#4b3b5c" />
                  <path d="M32 28 C40 12, 52 12, 60 20 C52 28, 40 28, 32 28 Z" fill="#4b3b5c" />
                  <path d="M26 28 C28 26, 36 26, 38 28 C40 32, 34 38, 32 42 Z" fill="#4b3b5c" />
                </svg>
              </div>

              {/* 3D DOOR GATES (Swing open on scroll) */}
              <div className="absolute inset-0 w-full h-full z-30 flex items-center justify-center pointer-events-none">
                {/* Gate Left Door */}
                <div
                  ref={gateLeftRef}
                  className="absolute left-0 top-0 w-1/2 h-full border-r border-yellow-500/20 bg-gradient-to-r from-purple-950/40 to-[#0a0a0f] flex justify-end items-center origin-left select-none shadow-[10px_0_30px_rgba(0,0,0,0.5)] pointer-events-auto"
                >
                  <div className="w-[120px] md:w-[240px] h-[350px] border border-yellow-500/30 rounded-l-full relative flex items-center justify-end pr-2 md:pr-6">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-16 rounded-l-full bg-yellow-600/30 border border-yellow-500/40 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Gate Right Door */}
                <div
                  ref={gateRightRef}
                  className="absolute right-0 top-0 w-1/2 h-full border-l border-yellow-500/20 bg-gradient-to-l from-purple-950/40 to-[#0a0a0f] flex justify-start items-center origin-right select-none shadow-[-10px_0_30px_rgba(0,0,0,0.5)] pointer-events-auto"
                >
                  <div className="w-[120px] md:w-[240px] h-[350px] border border-yellow-500/30 rounded-r-full relative flex items-center justify-start pl-2 md:pl-6">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-16 rounded-r-full bg-yellow-600/30 border border-yellow-500/40 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    </div>
                  </div>
                </div>

                {/* Central Opening Scroll Prompt */}
                <div ref={scrollPromptRef} className="absolute text-center z-40 pointer-events-none select-none max-w-sm px-6">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-yellow-500/80 font-bold mb-2 block">The Royal Invitation</span>
                  <h2 className="text-3xl font-serif text-gray-100 mb-6 drop-shadow-md">{data.brideName} & {data.groomName}</h2>
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <span className="text-xs text-gray-400 tracking-wider">Scroll to open doors</span>
                    <ChevronDown className="w-5 h-5 text-yellow-500 animate-bounce mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* ================= SCENE 3: DATE & VENUE ================= */}
      {isOpened && (
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
          {/* Background Palace Image */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
            <img
              src="/palace.png"
              alt="Royal Venue"
              className="w-full h-full object-cover opacity-25 mix-blend-overlay filter blur-[1px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ffffff]/15 to-transparent" />
          </div>

          <DecorativeFlora type="corner-blooms" primaryColor={data.primaryColor} secondaryColor={data.secondaryColor} />

          {/* Standing Peacock on Column */}
          <div className="absolute right-4 bottom-2 z-10 md:right-16">
            <Animals type="peacock" />
          </div>

          <div className="max-w-2xl mx-auto text-center z-10 bg-white/50 backdrop-blur-md border border-white/30 rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col items-center gap-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Heart className="w-6 h-6 text-white fill-white animate-pulse" />
            </div>

            <h2 className="text-3xl font-serif text-gray-800 font-bold">Save the Date</h2>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center my-4">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-purple-500/10 rounded-full border border-purple-500/20 text-purple-700">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Date</span>
                <span className="text-lg font-bold text-gray-800">
                  {new Date(data.weddingDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="w-[1px] h-12 bg-gray-300 hidden md:block" />

              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-pink-500/10 rounded-full border border-pink-500/20 text-pink-700">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-wider text-gray-500">Venue</span>
                <span className="text-lg font-bold text-gray-800 max-w-xs">{data.venue}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= SCENE 4: EVENT TIMELINE ================= */}
      {isOpened && (
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
          {/* Animated Elephant on Left */}
          <div className="absolute left-0 bottom-2 z-10 md:left-12 opacity-80">
            <Animals type="elephant" />
          </div>

          <div className="max-w-xl mx-auto w-full z-10 flex flex-col items-center">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-purple-800/80 mb-3">Celebrations</span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-800 font-bold mb-12">Wedding Festivities</h2>

            {/* Dynamic Events Cards Stack */}
            <div className="flex flex-col gap-6 w-full">
              {activeEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="event-card w-full text-left bg-white/70 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-purple-300 hover:scale-[1.01] transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/90 border border-gray-100 flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-md font-bold text-gray-800 font-sans tracking-wide">{event.name}</h3>
                      <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                        Details
                      </span>
                    </div>

                    {/* Subtitle - low colouring clickable indicator */}
                    <p className="text-[10px] text-purple-950/50 font-bold italic mt-0.5 tracking-wide">
                      {event.subtext}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2 border-t border-gray-200/50 pt-2">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" /> {event.date}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pink-500" /> {event.time}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {activeEvents.length === 0 && (
                <div className="p-10 bg-white/40 border border-white/50 rounded-2xl text-center">
                  <span className="text-2xl block mb-2">📜</span>
                  <p className="text-sm font-medium text-gray-500">No events customized yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= SCENE 5: CLOSING & RSVP ================= */}
      {isOpened && (
        <section className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 text-center select-none overflow-hidden bg-black/5">
          
          {/* Glowing Hanging Lights */}
          <div className="absolute top-0 inset-x-0 h-16 pointer-events-none flex justify-between px-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-yellow-500/40 relative rounded-b-full flex flex-col justify-end items-center"
                style={{
                  animation: `sway-slow ${3 + (i % 3)}s ease-in-out infinite`,
                  animationDelay: `${i * -0.5}s`,
                  height: `${20 + (i % 4) * 8}px`
                }}
              >
                <div className="w-3 h-3 rounded-full bg-yellow-300 shadow-[0_0_8px_#f59e0b] -mb-1 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto w-full bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-sm flex flex-col items-center gap-6">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-gray-500">Happily Ever After</span>
            <h2 className="text-2xl md:text-3xl font-serif text-gray-800 font-bold">We can't wait to celebrate with you!</h2>

            <div className="w-full h-[1px] bg-gray-300/60 my-2" />

            {rsvpSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl w-full text-center">
                <span className="text-2xl mb-1 block">🎉</span>
                <p className="text-emerald-800 font-bold text-sm font-sans">Thank you for your RSVP!</p>
                <p className="text-emerald-700 text-xs mt-0.5">We look forward to celebrating together.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="w-full flex flex-col gap-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Confirm Attendance</span>
                
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 text-sm"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Guests Count</label>
                    <select
                      value={rsvpGuests}
                      onChange={(e) => setRsvpGuests(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Attending?</label>
                    <div className="flex border border-gray-300 rounded-xl overflow-hidden text-sm bg-white/80 h-[38px]">
                      <button
                        type="button"
                        onClick={() => setRsvpStatus("yes")}
                        className={`flex-1 font-semibold ${
                          rsvpStatus === "yes" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setRsvpStatus("no")}
                        className={`flex-1 font-semibold ${
                          rsvpStatus === "no" ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={rsvpStatus === "pending"}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit RSVP
                </button>
              </form>
            )}

            <div className="flex flex-col items-center gap-1 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1 font-bold text-gray-600">
                <Phone className="w-3.5 h-3.5" /> RSVP Contact
              </span>
              <span>{data.additionalDetails || "+91 98765 43210"}</span>
            </div>
          </div>
        </section>
      )}

      {/* ================= MODAL: EVENT EXTRA DETAILS (GLASSMORPHISM POPUP) ================= */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-lg border border-white/60 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative animate-scale-up">
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-800 hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-gray-200/50 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {selectedEvent.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-gray-900 font-serif">{selectedEvent.name}</h3>
                <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider font-sans">
                  Ceremony Itinerary
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Date</span>
                <span className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1 font-sans">
                  <Calendar className="w-3.5 h-3.5 text-purple-500" /> {selectedEvent.date}
                </span>
              </div>
              <div className="p-3 bg-pink-500/5 border border-pink-500/10 rounded-xl text-center">
                <span className="text-[10px] text-gray-400 font-bold block uppercase mb-1">Time</span>
                <span className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1 font-sans">
                  <Clock className="w-3.5 h-3.5 text-pink-500" /> {selectedEvent.time}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Important Notes & Itinerary</span>
              <p className="text-sm text-gray-700 leading-relaxed bg-white/40 p-4 rounded-xl border border-white/50 max-h-[200px] overflow-y-auto font-sans">
                {selectedEvent.extraDetails || "No additional information provided."}
              </p>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Background YouTube Audio player */}
      {isOpened && data.youtubeUrl && (
        <YoutubeAudioPlayer youtubeUrl={data.youtubeUrl} forcePlay={audioTriggered} />
      )}
    </div>
  );
};
