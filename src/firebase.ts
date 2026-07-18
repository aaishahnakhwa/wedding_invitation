import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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

// Compress data to Base64 string for URL shareability without database
export const encodeInvitationData = (data: InvitationData): string => {
  try {
    const jsonStr = JSON.stringify(data);
    // basic base64 encoding (in browser, btoa handles latin1)
    // We escape to support utf-8 characters properly
    const escaped = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
    return btoa(escaped);
  } catch (e) {
    console.error("Error encoding invitation data", e);
    return "";
  }
};

// Decompress data from Base64
export const decodeInvitationData = (str: string): InvitationData | null => {
  try {
    // URL parameters often convert '+' into spaces. Replace them back.
    const normalized = str.replace(/ /g, "+");
    const decoded = atob(normalized);
    const unescaped = decoded.split("").map((c) => {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join("");
    return JSON.parse(decodeURIComponent(unescaped));
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
