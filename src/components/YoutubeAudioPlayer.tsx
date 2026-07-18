import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react";

interface YoutubeAudioPlayerProps {
  youtubeUrl: string;
  forcePlay?: boolean; // Can be triggered by parent on user interaction
}

// Global helper to parse YouTube URL (exported for reuse)
export const getYoutubeId = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  try {
    // 1. Handle YouTube Shorts
    if (trimmed.includes("/shorts/")) {
      const parts = trimmed.split("/shorts/");
      if (parts[1]) return parts[1].substring(0, 11);
    }
    // 2. Handle URL Hostnames
    const urlObj = new URL(trimmed);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1, 12);
    }
    if (urlObj.hostname.includes("youtube.com")) {
      const v = urlObj.searchParams.get("v");
      if (v) return v.substring(0, 11);
      const pathParts = urlObj.pathname.split("/");
      const embedIdx = pathParts.indexOf("embed");
      if (embedIdx !== -1 && pathParts[embedIdx + 1]) {
        return pathParts[embedIdx + 1].substring(0, 11);
      }
    }
  } catch (e) {
    // Fallback RegExp if URL parsing fails
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  }
  return null;
};

export const YoutubeAudioPlayer: React.FC<YoutubeAudioPlayerProps> = ({ youtubeUrl, forcePlay }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [songTitle, setSongTitle] = useState("Your special wedding song");
  const playerRef = useRef<any>(null);
  const iframeContainerId = "hidden-youtube-player";

  const videoId = getYoutubeId(youtubeUrl);

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player(iframeContainerId, {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: videoId, // loop requirement
          playsinline: 1,
          mute: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(60);
            
            // If autoplay is pre-cleared by forcePlay (e.g. click overlay)
            if (forcePlay) {
              event.target.playVideo();
            }

            const data = event.target.getVideoData();
            if (data && data.title) {
              setSongTitle(data.title);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Sync forcePlay state changes
  useEffect(() => {
    if (forcePlay && playerRef.current && typeof playerRef.current.playVideo === "function") {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [forcePlay]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  if (!videoId) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-950/80 backdrop-blur-md border border-red-500/30 px-6 py-2.5 rounded-full z-50 text-[10px] text-red-300 font-bold">
        ⚠️ Invalid YouTube Audio Link provided
      </div>
    );
  }

  return (
    <>
      <div className="absolute w-0 h-0 opacity-0 pointer-events-none">
        <div id={iframeContainerId}></div>
      </div>

      {/* Floating play/pause controller */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 flex items-center gap-4 max-w-sm w-[90%] md:w-auto transition-all duration-300 hover:border-purple-500/30 select-none">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Music className={`w-4 h-4 text-purple-400 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Background Music</span>
            <span className="text-xs text-gray-100 font-semibold truncate max-w-[150px] md:max-w-[200px]">
              {songTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
          </button>
        </div>
      </div>
    </>
  );
};
