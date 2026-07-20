import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import LZString from "lz-string";

// Default placeholder config. In production, these should be in a .env file.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db: any = null;
let firebaseEnabled = false;

if (firebaseConfig.projectId && firebaseConfig.projectId !== "") {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseEnabled = true;
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Firebase failed to initialize. Falling back to local storage and URL queries.", error);
  }
} else {
  console.log("Firebase project ID not found. Using local/URL parameters fallback mode.");
}

export interface InvitationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
  additionalDetails?: string;
  primaryColor: string;
  secondaryColor: string;
  gradientStart: string;
  gradientEnd: string;
  youtubeUrl: string;
  events?: {
    id: string;
    name: string;
    date: string;
    time: string;
    icon: string;
    subtext: string;
    extraDetails?: string;
  }[];
}

// Compress data using LZString for ultra-compact URL shareability (~82% shorter!)
export const encodeInvitationData = (data: InvitationData): string => {
  try {
    // Extract video ID if full URL to save payload space
    let youtubeId = data.youtubeUrl || "";
    if (youtubeId) {
      const match = youtubeId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      if (match && match[1]) {
        youtubeId = match[1];
      }
    }

    const cleanColor = (c: string) => (c && c.startsWith("#") ? c.slice(1) : c || "");

    // Create compact object with short key names
    const compactObj: Record<string, any> = {
      b: data.brideName,
      g: data.groomName,
      d: data.weddingDate,
      v: data.venue,
      p: cleanColor(data.primaryColor),
      s: cleanColor(data.secondaryColor),
      gs: cleanColor(data.gradientStart),
      ge: cleanColor(data.gradientEnd),
      y: youtubeId,
    };

    if (data.additionalDetails) compactObj.a = data.additionalDetails;

    if (data.events && data.events.length > 0) {
      compactObj.e = data.events.map((ev) => ({
        i: ev.id,
        n: ev.name,
        d: ev.date,
        t: ev.time,
        ic: ev.icon,
        st: ev.subtext,
        ...(ev.extraDetails ? { ex: ev.extraDetails } : {}),
      }));
    }

    const jsonStr = JSON.stringify(compactObj);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return `lz_${compressed}`;
  } catch (e) {
    console.error("Error encoding invitation data", e);
    return "";
  }
};

// Decompress data from LZString or legacy Base64 fallback
export const decodeInvitationData = (str: string): InvitationData | null => {
  if (!str) return null;
  try {
    let jsonStr: string | null = null;

    // Mode 1: LZString prefix format
    if (str.startsWith("lz_")) {
      const payload = str.substring(3);
      jsonStr = LZString.decompressFromEncodedURIComponent(payload);
    } else {
      // Try direct LZString decompress
      const decompressed = LZString.decompressFromEncodedURIComponent(str);
      if (decompressed && (decompressed.startsWith("{") || decompressed.startsWith("["))) {
        jsonStr = decompressed;
      }
    }

    // Mode 2: Legacy Base64 decoding fallback
    if (!jsonStr) {
      try {
        const normalized = str.replace(/ /g, "+");
        const decoded = atob(normalized);
        jsonStr = decoded.split("").map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        }).join("");
        jsonStr = decodeURIComponent(jsonStr);
      } catch (e) {
        // Fallback failed
      }
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);
    const restoreColor = (c?: string, defaultHex = "#ffffff") => {
      if (!c) return defaultHex;
      return c.startsWith("#") ? c : `#${c}`;
    };

    // If compact format (has 'b' key instead of 'brideName')
    if (parsed && typeof parsed === "object" && "b" in parsed) {
      let youtubeUrl = parsed.y || "";
      if (youtubeUrl && !youtubeUrl.startsWith("http")) {
        youtubeUrl = `https://www.youtube.com/watch?v=${youtubeUrl}`;
      }

      const fullData: InvitationData = {
        brideName: parsed.b || "",
        groomName: parsed.g || "",
        weddingDate: parsed.d || "",
        venue: parsed.v || "",
        additionalDetails: parsed.a || "",
        primaryColor: restoreColor(parsed.p, "#AE6FF1"),
        secondaryColor: restoreColor(parsed.s, "#FFB7C5"),
        gradientStart: restoreColor(parsed.gs, "#FFF1EB"),
        gradientEnd: restoreColor(parsed.ge, "#ACE0F9"),
        youtubeUrl: youtubeUrl,
        events: Array.isArray(parsed.e)
          ? parsed.e.map((ev: any) => ({
              id: ev.i || Math.random().toString(36).substring(2, 7),
              name: ev.n || "",
              date: ev.d || "",
              time: ev.t || "",
              icon: ev.ic || "✨",
              subtext: ev.st || "",
              extraDetails: ev.ex || "",
            }))
          : [],
      };
      return fullData;
    }

    // Otherwise, return legacy uncompressed format
    return parsed as InvitationData;
  } catch (e) {
    console.error("Error decoding invitation data", e);
    return null;
  }
};

// Save invitation - returns an object with local fallback URL and Firebase state
export const saveInvitation = async (
  data: InvitationData
): Promise<{ id: string; isFirebase: boolean }> => {
  const localId = Math.random().toString(36).substring(2, 10);
  
  // Always save locally to localStorage as a safety net
  try {
    localStorage.setItem(`invite_${localId}`, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to write to LocalStorage", e);
  }

  if (firebaseEnabled && db) {
    try {
      // Create a unique document ID
      const firebaseId = Math.random().toString(36).substring(2, 10);
      await setDoc(doc(db, "invitations", firebaseId), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: firebaseId, isFirebase: true };
    } catch (error) {
      console.error("Firebase save failed. Falling back to local ID.", error);
      return { id: localId, isFirebase: false };
    }
  }

  return { id: localId, isFirebase: false };
};

// Retrieve invitation
export const getInvitation = async (id: string): Promise<InvitationData | null> => {
  // 1. Try Firebase if enabled
  if (firebaseEnabled && db) {
    try {
      const docSnap = await getDoc(doc(db, "invitations", id));
      if (docSnap.exists()) {
        return docSnap.data() as InvitationData;
      }
    } catch (e) {
      console.warn("Firebase fetch failed, trying local storage next...", e);
    }
  }

  // 2. Try LocalStorage
  try {
    const localData = localStorage.getItem(`invite_${id}`);
    if (localData) {
      return JSON.parse(localData) as InvitationData;
    }
  } catch (e) {
    console.error("LocalStorage fetch failed", e);
  }

  return null;
};
