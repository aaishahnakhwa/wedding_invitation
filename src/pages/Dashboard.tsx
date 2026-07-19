import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User,
  Palette,
  Music,
  Share2,
  Check,
  Copy,
  Sparkles,
  Smartphone,
  Info,
  Volume2,
  Plus,
  Trash2
} from "lucide-react";
import { saveInvitation, encodeInvitationData, type InvitationData } from "../firebase";
import { Invitation } from "./Invitation";

// Validation Schema for Individual Event
const eventSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  icon: z.string().min(1, "Icon/Emoji is required"),
  subtext: z.string().min(1, "Help subtext is required"),
  extraDetails: z.string().optional(),
});

// Main Invitation Schema
const schema = z.object({
  brideName: z.string().min(1, "Bride's name is required"),
  groomName: z.string().min(1, "Groom's name is required"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  venue: z.string().min(5, "Venue details are required"),
  additionalDetails: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  gradientStart: z.string(),
  gradientEnd: z.string(),
  youtubeUrl: z.string().url("Must be a valid URL").regex(/youtube\.com|youtu\.be/, "Must be a YouTube link"),
  events: z.array(eventSchema),
});

type FormValues = z.infer<typeof schema>;

const PRESET_GRADIENTS = [
  { name: "Sunset Gold", start: "#FFF1EB", end: "#ACE0F9", primary: "#AE6FF1", secondary: "#FFB7C5" },
  { name: "Royal Lavender", start: "#F8C2EB", end: "#A6C1EE", primary: "#8A4FFF", secondary: "#FFAAA6" },
  { name: "Cherry Bloom", start: "#FFEDF2", end: "#FFC3A0", primary: "#D90429", secondary: "#FF758F" },
  { name: "Forest Vine", start: "#E3F2FD", end: "#C8E6C9", primary: "#388E3C", secondary: "#81C784" },
  { name: "Midnight Magic", start: "#2E0854", end: "#120224", primary: "#D383FC", secondary: "#FF9CEE" },
];

export const Dashboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize form with defaults matching reference mockup
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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
          subtext: "Click for reception venue detail",
          extraDetails: "Dress Code: Indo-Western or Formals. Share a glass of champagne with us, cut the cake, and dance the night away to our live band.",
        },
      ],
    },
  });

  // Setup field array for dynamic wedding festivities
  const { fields, append, remove } = useFieldArray({
    control,
    name: "events",
  });

  // Watch fields to render live preview on the right
  const formData = watch();

  // Watch for preset changes to keep fields in sync
  const selectPreset = (preset: typeof PRESET_GRADIENTS[0]) => {
    setValue("gradientStart", preset.start);
    setValue("gradientEnd", preset.end);
    setValue("primaryColor", preset.primary);
    setValue("secondaryColor", preset.secondary);
  };

  const onSubmit = async (values: FormValues) => {
    setIsGenerating(true);
    try {
      const inviteData: InvitationData = {
        ...values,
      };

      // Save to Database (Firestore) with Local Storage fallback
      const { id, isFirebase } = await saveInvitation(inviteData);
      
      // Construct sharing link
      let shareUrl = "";
      if (isFirebase) {
  shareUrl = `${window.location.origin}/wedding_invitation/#/invite/${id}`;
} else {
  const compressedData = encodeInvitationData(inviteData);
  shareUrl = `${window.location.origin}/wedding_invitation/#/invite?data=${compressedData}`;
}

setGeneratedLink(shareUrl);
setCurrentStep(4);
} catch (e) {
  console.error(e);
  alert("Failed to generate link. Creating fallback URL.");
  const compressedData = encodeInvitationData(values);
  setGeneratedLink(`${window.location.origin}/wedding_invitation/#/invite?data=${compressedData}`);
  setCurrentStep(4);
} finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to add a new empty festivity card
  const handleAddFestivity = () => {
    append({
      id: Math.random().toString(36).substring(2, 9),
      name: "New Ceremony",
      date: formData.weddingDate || "2025-11-24",
      time: "12:00 PM",
      icon: "✨",
      subtext: "Click for more details on dress code",
      extraDetails: "Dress Code: Traditional. Details about the event go here.",
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9fc] text-gray-800 flex flex-col items-center">
      {/* Header */}
      <header className="w-full text-center py-12 px-6">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-purple-950 tracking-tight">
          Caricature Wedding Invitation Website
        </h1>
        <p className="text-sm md:text-base text-pink-600 font-medium tracking-wide mt-2">
          Create. Customize. Share Beautiful Moments.
        </p>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl px-4 md:px-8 flex flex-col lg:flex-row gap-8 pb-16">
        
        {/* Left Column: Multi-step Creator Form */}
        <section className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-[0_15px_50px_rgba(141,120,180,0.06)] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-serif text-gray-900 font-bold mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" /> Create Your Invitation
            </h2>

            {/* Stepper Tabs */}
            <div className="flex justify-between border-b border-gray-100 pb-6 mb-8 text-xs font-semibold overflow-x-auto gap-4">
              {[
                { number: 1, label: "Basic Details", icon: User },
                { number: 2, label: "Personalization", icon: Palette },
                { number: 3, label: "Music", icon: Music },
                { number: 4, label: "Preview & Share", icon: Share2 },
              ].map((step) => (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => step.number <= currentStep || generatedLink ? setCurrentStep(step.number) : null}
                  className={`flex items-center gap-2 pb-2 border-b-2 transition-all ${
                    currentStep === step.number
                      ? "border-purple-600 text-purple-700"
                      : step.number < currentStep
                      ? "border-emerald-500 text-emerald-600"
                      : "border-transparent text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      currentStep === step.number
                        ? "bg-purple-600 text-white"
                        : step.number < currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step.number < currentStep ? <Check className="w-3.5 h-3.5" /> : step.number}
                  </span>
                  <span className="whitespace-nowrap">{step.label}</span>
                </button>
              ))}
            </div>

            {/* Form Steps */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* STEP 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Stepper Part A: Couple & Date */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-purple-900 border-b border-gray-100 pb-2">1. Main Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Bride's Name</label>
                        <input
                          type="text"
                          {...register("brideName")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                          placeholder="Ananya"
                        />
                        {errors.brideName && <p className="text-red-500 text-xs mt-1">{errors.brideName.message}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Groom's Name</label>
                        <input
                          type="text"
                          {...register("groomName")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                          placeholder="Rahul"
                        />
                        {errors.groomName && <p className="text-red-500 text-xs mt-1">{errors.groomName.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Wedding Date</label>
                        <input
                          type="date"
                          {...register("weddingDate")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                        />
                        {errors.weddingDate && <p className="text-red-500 text-xs mt-1">{errors.weddingDate.message}</p>}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Venue Location</label>
                        <input
                          type="text"
                          {...register("venue")}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                          placeholder="The Royal Garden Palace, Udaipur"
                        />
                        {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">RSVP Info / Footer Text</label>
                      <input
                        type="text"
                        {...register("additionalDetails")}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                        placeholder="RSVP: +91 98765 43210"
                      />
                    </div>
                  </div>

                  {/* Stepper Part B: Dynamic Festivities (Add/Remove) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-purple-900">2. Wedding Festivities</h3>
                      <button
                        type="button"
                        onClick={handleAddFestivity}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Festivity
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                      {fields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="p-4 bg-gray-50 border border-gray-200 rounded-2xl relative flex flex-col gap-3 group"
                        >
                          {/* Trash button */}
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                            Festivity #{idx + 1}
                          </span>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Emoji Icon */}
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Icon / Emoji</label>
                              <input
                                type="text"
                                {...register(`events.${idx}.icon` as const)}
                                className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-center text-sm bg-white"
                                placeholder="✨"
                              />
                            </div>
                            {/* Ceremony Name */}
                            <div className="col-span-2">
                              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Ceremony Name</label>
                              <input
                                type="text"
                                {...register(`events.${idx}.name` as const)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
                                placeholder="Haldi Ceremony"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {/* Date */}
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Date</label>
                              <input
                                type="text"
                                {...register(`events.${idx}.date` as const)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                                placeholder="22nd November 2025"
                              />
                            </div>
                            {/* Time */}
                            <div>
                              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Time</label>
                              <input
                                type="text"
                                {...register(`events.${idx}.time` as const)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                                placeholder="11:00 AM"
                              />
                            </div>
                          </div>

                          {/* Card Subtitle */}
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Card Subtitle (Help Text)</label>
                            <input
                              type="text"
                              {...register(`events.${idx}.subtext` as const)}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              placeholder="Click for more details on dress code"
                            />
                          </div>

                          {/* Extra Information / Modal details */}
                          <div>
                            <label className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">Extra Details (Modal Details)</label>
                            <textarea
                              {...register(`events.${idx}.extraDetails` as const)}
                              rows={2}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                              placeholder="Dress Code: Yellow. Details about buffet, theme, decorations, etc."
                            />
                          </div>
                        </div>
                      ))}
                      {fields.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-2xl">
                          <p className="text-xs text-gray-400">No festivities added yet. Click "Add Festivity" above.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Personalization (Themes/Colors) */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Preset Gradients */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Select Preset Theme Palette</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {PRESET_GRADIENTS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => selectPreset(preset)}
                          className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-purple-500 text-left transition-all active:scale-95"
                        >
                          <div className="flex gap-1 mb-2">
                            <span className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: preset.primary }} />
                            <span className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: preset.secondary }} />
                          </div>
                          <div className="w-full h-3 rounded-lg border border-gray-100 mb-1" style={{ background: `linear-gradient(90deg, ${preset.start}, ${preset.end})` }} />
                          <span className="text-[10px] text-gray-500 font-bold block truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gray-100" />

                  {/* Custom Colors Customizer */}
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Custom Colors</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Primary Color</label>
                        <div className="flex items-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-50">
                          <input
                            type="color"
                            value={watch("primaryColor")}
                            onChange={(e) => setValue("primaryColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            {...register("primaryColor")}
                            className="w-full text-xs font-bold uppercase bg-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Secondary Color</label>
                        <div className="flex items-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-50">
                          <input
                            type="color"
                            value={watch("secondaryColor")}
                            onChange={(e) => setValue("secondaryColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            {...register("secondaryColor")}
                            className="w-full text-xs font-bold uppercase bg-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Gradient Start</label>
                        <div className="flex items-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-50">
                          <input
                            type="color"
                            value={watch("gradientStart")}
                            onChange={(e) => setValue("gradientStart", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            {...register("gradientStart")}
                            className="w-full text-xs font-bold uppercase bg-transparent outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Gradient End</label>
                        <div className="flex items-center gap-2 border border-gray-200 p-2.5 rounded-xl bg-gray-50">
                          <input
                            type="color"
                            value={watch("gradientEnd")}
                            onChange={(e) => setValue("gradientEnd", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                          />
                          <input
                            type="text"
                            {...register("gradientEnd")}
                            className="w-full text-xs font-bold uppercase bg-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Background Music */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">YouTube Song Link</label>
                    <input
                      type="text"
                      {...register("youtubeUrl")}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800 bg-gray-50/50"
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    />
                    {errors.youtubeUrl && <p className="text-red-500 text-xs mt-1">{errors.youtubeUrl.message}</p>}
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex gap-3 text-xs text-purple-950">
                    <Volume2 className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <span className="font-bold block mb-0.5">Automated Audio Background Stream</span>
                      <p className="text-purple-900/80 leading-relaxed">
                        Provide a YouTube video link. We extract the audio tracks automatically to serve as the background atmosphere. The song plays once the invite page is opened and scrolled.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Generate Link */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  {generatedLink ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                        <span className="text-3xl mb-1 block">🎉</span>
                        <h3 className="font-bold text-emerald-800 text-md">Your Invitation Link is Ready!</h3>
                        <p className="text-emerald-700 text-xs mt-0.5">Share this special link with your loved ones.</p>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={generatedLink}
                          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Link
                            </>
                          )}
                        </button>
                      </div>

                      <div className="w-full text-center">
                        <a
                          href={generatedLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                        >
                          Open Invitation Page in a New Tab →
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-sm mb-4">Complete all details and review your custom settings in the preview window.</p>
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-sm"
                      >
                        {isGenerating ? "Generating..." : "Generate Invitation Link"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Stepper Buttons (Bottom) */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Next
              </button>
            ) : currentStep === 3 && !generatedLink ? (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95"
              >
                Generate Link
              </button>
            ) : currentStep === 3 && generatedLink ? (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                Next
              </button>
            ) : null}
          </div>
        </section>

        {/* Right Column: Live Mockup Preview Panel */}
        <section className="w-full lg:w-[380px] bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_15px_50px_rgba(141,120,180,0.06)] flex flex-col items-center">
          <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-4.5 h-4.5 text-purple-600" /> Live Invitation Preview
          </h3>

          {/* Smartphone Frame Wrapper */}
          <div className="relative w-full aspect-[9/18] border-8 border-gray-800 rounded-[36px] overflow-hidden shadow-2xl bg-black">
            {/* Speaker bar */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-800 rounded-full z-50 flex items-center justify-center">
              <div className="w-8 h-1 bg-gray-700 rounded-full" />
            </div>

            {/* Embedded Live React component */}
            <div className="w-full h-full overflow-hidden text-left">
              <Invitation previewData={formData as InvitationData} />
            </div>

            {/* Simulated home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600/50 rounded-full z-50 pointer-events-none" />
          </div>

          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed text-center flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-purple-400" /> Shows interactive preview layout in real-time.
          </p>
        </section>
      </main>

      {/* Workflow: How It Works */}
      <section className="w-full max-w-7xl px-4 md:px-8 py-12 border-t border-gray-100">
        <h3 className="text-xl font-serif font-black text-center text-purple-950 mb-8">How It Works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {[
            { step: "1", title: "Fill Details", desc: "Input names, wedding date, venue, and events.", icon: "✍️" },
            { step: "2", title: "Customize Theme", desc: "Select custom color gradients and presets.", icon: "🎨" },
            { step: "3", title: "Add Background Music", desc: "Paste any YouTube link to stream sweet audio.", icon: "🎵" },
            { step: "4", title: "Generate & Copy", desc: "Create a unique shareable web invitation link.", icon: "🔗" },
            { step: "5", title: "Delight Guests", desc: "Guests scroll through beautiful animations.", icon: "💖" },
          ].map((item) => (
            <div key={item.step} className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm relative flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-xs text-purple-600 mb-3">
                {item.step}
              </div>
              <span className="text-2xl mb-1">{item.icon}</span>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Features */}
      <footer className="w-full max-w-7xl px-4 md:px-8 py-12 border-t border-gray-100 text-center text-xs text-gray-400">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6">
          {[
            { label: "Scroll-Based Animations", desc: "Smooth scroll story" },
            { label: "Real-time Idle Motion", desc: "Nature sways & flaps" },
            { label: "Seamless Audio Stream", desc: "YouTube iframe API" },
            { label: "Interactive RSVP Form", desc: "Guest attendance track" },
          ].map((feat, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="font-bold text-purple-900/60 uppercase tracking-wider">{feat.label}</span>
              <span className="text-[10px] text-gray-400">{feat.desc}</span>
            </div>
          ))}
        </div>
        <p>© 2026 Caricature Wedding Stories. All rights reserved.</p>
      </footer>
    </div>
  );
};
