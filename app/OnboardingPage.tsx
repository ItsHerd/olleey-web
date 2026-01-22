"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  ArrowRight,
  Check,
  Mic,
  Upload,
  Globe2,
  Settings,
  Loader2,
  AlertCircle,
  X,
  Plus,
} from "lucide-react";
import { youtubeAPI, dashboardAPI, voiceAPI, preferencesAPI, type YouTubeConnection } from "@/lib/api";
import { logger } from "@/lib/logger";

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4;

const LANGUAGE_OPTIONS = [
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
];

export default function OnboardingPage({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Step 1: Master Channel
  const [masterChannel, setMasterChannel] = useState<YouTubeConnection | null>(null);
  const [connectingMaster, setConnectingMaster] = useState(false);
  const [masterError, setMasterError] = useState<string | null>(null);
  
  // Step 2: Satellite Channels
  const [satelliteChannels, setSatelliteChannels] = useState<YouTubeConnection[]>([]);
  const [connectingSatellite, setConnectingSatellite] = useState(false);
  const [satelliteError, setSatelliteError] = useState<string | null>(null);
  
  // Step 3: Voice
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<"idle" | "uploading" | "checking" | "ready" | "error">("idle");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Step 4: Preferences
  const [autoDraft, setAutoDraft] = useState(true);
  const [toneMatch, setToneMatch] = useState<"strict" | "loose">("strict");
  const [vocabulary, setVocabulary] = useState<"genz" | "professional" | "neutral">("neutral");
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Check existing connections on mount
  useEffect(() => {
    checkExistingSetup();
  }, []);

  const checkExistingSetup = async () => {
    try {
      setIsLoading(true);
      const dashboard = await dashboardAPI.getDashboard();
      
      if (dashboard.youtube_connections && dashboard.youtube_connections.length > 0) {
        const primary = dashboard.youtube_connections.find(c => c.is_primary);
        const satellites = dashboard.youtube_connections.filter(c => !c.is_primary);
        
        if (primary) {
          setMasterChannel(primary);
          setCurrentStep(2);
        }
        
        if (satellites.length > 0) {
          setSatelliteChannels(satellites);
        }
      }
    } catch (error) {
      logger.error("Onboarding", "Failed to check existing setup", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncMasterChannel = async () => {
    setConnectingMaster(true);
    setMasterError(null);
    
    try {
      const { auth_url } = await youtubeAPI.initiateConnection();
      
      // Redirect directly to backend - browser will follow redirects automatically
      window.location.href = auth_url;
    } catch (error) {
      logger.error("Onboarding", "Master channel connection error", error);
      setMasterError(error instanceof Error ? error.message : "Failed to connect. Please try again.");
      setConnectingMaster(false);
    }
  };

  const handleConnectSatellite = async () => {
    setConnectingSatellite(true);
    setSatelliteError(null);
    
    try {
      // Pass master_connection_id if master channel is already connected
      const { auth_url } = await youtubeAPI.initiateConnection({
        master_connection_id: masterChannel?.connection_id
      });
      
      // Redirect directly to backend - browser will follow redirects automatically
      window.location.href = auth_url;
    } catch (error) {
      logger.error("Onboarding", "Satellite channel connection error", error);
      setSatelliteError(error instanceof Error ? error.message : "Failed to connect. Please try again.");
      setConnectingSatellite(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("audio/")) {
      setVoiceError("Please upload an audio file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setVoiceError("File too large. Maximum 10MB");
      return;
    }

    setVoiceFile(file);
    setVoiceError(null);
    validateVoiceFile(file);
  };

  const validateVoiceFile = async (file: File) => {
    setVoiceStatus("checking");
    setVoiceError(null);
    
    try {
      const qualityCheck = await voiceAPI.checkVoiceQuality(file);
      
      if (!qualityCheck.passed) {
        setVoiceError(qualityCheck.issues?.join(". ") || "Voice quality check failed. Please try again.");
        setVoiceStatus("error");
      } else {
        setVoiceStatus("uploading");
        const result = await voiceAPI.uploadVoiceSample(file);
        logger.info("Voice", "Voice sample uploaded successfully", result);
        setVoiceStatus("ready");
      }
    } catch (error) {
      logger.error("Voice", "Voice validation failed", error);
      setVoiceError(error instanceof Error ? error.message : "Failed to validate voice. Please try again.");
      setVoiceStatus("error");
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 120) {
          clearInterval(interval);
          handleStopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    
    if (recordingTime < 30) {
      setVoiceError("Recording too short. Please record at least 30 seconds.");
      setVoiceStatus("error");
    } else {
    setVoiceStatus("ready");
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    
    try {
      await preferencesAPI.savePreferences({
        auto_draft: autoDraft,
        tone_match: toneMatch,
        vocabulary: vocabulary,
      });
      
      logger.info("Onboarding", "Preferences saved", {
        autoDraft,
        toneMatch,
        vocabulary
      });
      
      onComplete();
    } catch (error) {
      logger.error("Onboarding", "Failed to save preferences", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSavingPreferences(false);
    }
  };

  const canProceedToStep2 = masterChannel !== null;
  const canProceedToStep3 = satelliteChannels.length > 0;
  const canProceedToStep4 = voiceStatus === "ready" && voiceConsent;

  if (isLoading) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center z-50 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-dark-textSecondary" />
      </div>
    );
  }

        return (
    <div className="absolute inset-0 w-full h-full z-50 bg-white overflow-auto">
      <div className="max-w-5xl mx-auto px-12 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
            
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-normal transition-all ${
                    step < currentStep
                      ? "bg-indigo-600 border-indigo-600 text-dark-text"
                      : step === currentStep
                      ? "bg-white border-indigo-600 text-indigo-600"
                      : "bg-white border-gray-200 text-dark-textSecondary"
                  }`}
                >
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  step <= currentStep ? "text-gray-900" : "text-dark-textSecondary"
                }`}>
                  {step === 1 ? "Master" : step === 2 ? "Satellites" : step === 3 ? "Voice" : "Autopilot"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Command Center */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 mb-6 shadow-lg">
                  <Youtube className="w-8 h-8 text-dark-text" />
                </div>
                <h1 className="text-4xl font-normal text-gray-900 mb-3">
                  Sync Master Channel
                </h1>
                <p className="text-lg text-dark-textSecondary max-w-2xl mx-auto">
                  Connect your primary YouTube channel to automate content distribution across languages.
                </p>
            </div>

              {masterError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{masterError}</p>
              </div>
            )}

              {masterChannel ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-normal text-gray-900 mb-1">
                    Master Channel Connected
                  </h3>
                  <p className="text-sm text-dark-textSecondary mb-4">
                    {masterChannel.youtube_channel_name}
                  </p>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-6 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors"
                  >
                    Continue to Satellites
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
            <button
                    onClick={handleSyncMasterChannel}
              disabled={connectingMaster}
                    className="group relative inline-flex items-center justify-center gap-3 bg-dark-card text-gray-900 hover:bg-gray-200 px-12 py-6 rounded-full text-xl font-normal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectingMaster ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Youtube className="h-6 w-6" />
                        Sync Master Channel
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
            </button>
            </div>
              )}

              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                {["🌍 Multi-Language", "🚀 Auto-Distribute", "📊 Analytics"].map((feature, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-dark-card border border-gray-200">
                    <div className="text-3xl mb-2">{feature.split(" ")[0]}</div>
                    <div className="text-sm font-medium text-gray-900">{feature.split(" ").slice(1).join(" ")}</div>
          </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Satellite Setup */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-lg">
                  <Globe2 className="w-8 h-8 text-dark-text" />
                </div>
                <h1 className="text-4xl font-normal text-gray-900 mb-3">
                  Where do you want to go?
                </h1>
                <p className="text-lg text-dark-textSecondary max-w-2xl mx-auto">
                  Connect your target channels for different languages. Already created? Link them. Need new ones? Create them on YouTube first.
                </p>
              </div>

              {satelliteError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{satelliteError}</p>
            </div>
              )}

              {/* Visual Map */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                    <span className="text-3xl">🇺🇸</span>
                    <span className="font-normal text-gray-900">
                      {masterChannel?.youtube_channel_name || "Master"}
                    </span>
              </div>
                  <ArrowRight className="h-8 w-8 text-dark-textSecondary" />
                  <div className="flex flex-wrap gap-3">
                    {satelliteChannels.length === 0 ? (
                      <div className="px-6 py-3 bg-dark-card rounded-xl border-2 border-dashed border-gray-300">
                        <span className="text-dark-textSecondary">No satellites yet</span>
                      </div>
                    ) : (
                      satelliteChannels.map((channel, idx) => {
                        const lang = LANGUAGE_OPTIONS.find(l => channel.youtube_channel_name.toLowerCase().includes(l.name.toLowerCase()));
                        return (
                          <div key={channel.connection_id} className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border-2 border-green-200">
                            <span className="text-2xl">{lang?.flag || "🌐"}</span>
                            <span className="text-sm font-medium text-gray-900">{lang?.name || "Connected"}</span>
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        );
                      })
                    )}
                    </div>
                </div>

                <div className="flex gap-4 justify-center">
                <button
                  onClick={handleConnectSatellite}
                  disabled={connectingSatellite}
                    className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-6 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {connectingSatellite ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        Connect Existing Channel
                      </>
                    )}
                </button>
                  
                <a
                    href="https://studio.youtube.com"
                  target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-6 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors"
                >
                    Create New Channel
                    <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 text-dark-textSecondary hover:text-gray-900 font-medium"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                  Back
                </button>
                
                {satelliteChannels.length > 0 && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-6 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors"
                  >
                    Continue to Voice Setup
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Voice DNA */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 mb-6 shadow-lg">
                  <Mic className="w-8 h-8 text-dark-text" />
                </div>
                <h1 className="text-4xl font-normal text-gray-900 mb-3">
                  Voice DNA Capture
                </h1>
                <p className="text-lg text-dark-textSecondary max-w-2xl mx-auto">
                  Record or upload a clear audio sample to train your AI voice clone.
                </p>
            </div>

              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 space-y-6">
                {/* Consent */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                    id="voice-consent"
                  checked={voiceConsent}
                  onChange={(e) => setVoiceConsent(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                  <label htmlFor="voice-consent" className="flex-1 text-sm text-gray-700">
                    <strong className="font-normal text-gray-900">Required:</strong> I certify that I have the legal rights to clone this voice and use it for content creation.
              </label>
                </div>

                {voiceError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{voiceError}</p>
                  </div>
                )}

                {/* Recording / Upload */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Record */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-4">
                    <Mic className="h-12 w-12 text-dark-textSecondary mx-auto" />
                    <div>
                      <h3 className="font-normal text-gray-900 mb-1">Record Now</h3>
                      <p className="text-sm text-dark-textSecondary">Speak for 30-60 seconds</p>
                    </div>
                    
                    {isRecording ? (
                      <div className="space-y-3">
                        <div className="text-2xl font-normal text-red-600">
                          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <button
                          onClick={handleStopRecording}
                          className="w-full bg-red-600 text-dark-text px-4 py-3 rounded-xl font-normal hover:bg-red-700 transition-colors"
                        >
                          Stop Recording
                        </button>
                      </div>
                    ) : (
                <button
                        onClick={handleStartRecording}
                        disabled={!voiceConsent || voiceStatus === "ready"}
                        className="w-full bg-dark-card text-gray-900 px-4 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                        Start Recording
                </button>
                    )}
                  </div>

                  {/* Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center space-y-4">
                    <Upload className="h-12 w-12 text-dark-textSecondary mx-auto" />
                    <div>
                      <h3 className="font-normal text-gray-900 mb-1">Upload File</h3>
                      <p className="text-sm text-dark-textSecondary">MP3, WAV, or M4A (max 10MB)</p>
                    </div>
                    
                    <label className="block">
                  <input
                    type="file"
                    accept="audio/*"
                        onChange={handleFileUpload}
                        disabled={!voiceConsent || voiceStatus === "ready"}
                    className="hidden"
                  />
                      <span className="inline-block w-full bg-dark-card text-gray-900 px-4 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        Choose File
                      </span>
                </label>
                    
                    {voiceFile && (
                      <p className="text-sm text-dark-textSecondary truncate">
                        {voiceFile.name}
                      </p>
                    )}
              </div>
              </div>

                {/* Status */}
                {voiceStatus === "checking" && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Checking audio quality...</span>
                </div>
              )}
                
              {voiceStatus === "ready" && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Voice sample ready! Quality check passed.</span>
                  </div>
                )}

                {/* Prompt */}
                {voiceConsent && voiceStatus === "idle" && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <p className="text-sm font-medium text-indigo-900 mb-2">
                      Please read this calibration sentence:
                    </p>
                    <p className="text-sm text-indigo-700 italic">
                      "Hello, this is my voice sample for AI training. I'm speaking clearly and naturally to help create an accurate voice clone for multilingual content."
                    </p>
                </div>
              )}
            </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 text-dark-textSecondary hover:text-gray-900 font-medium"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                  Back
                </button>
                
                {canProceedToStep4 && (
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-6 py-3 rounded-full font-normal hover:bg-gray-200 transition-colors"
                  >
                    Continue to Preferences
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Autopilot Config */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 mb-6 shadow-lg">
                  <Settings className="w-8 h-8 text-dark-text" />
                </div>
                <h1 className="text-4xl font-normal text-gray-900 mb-3">
                  Autopilot Configuration
                </h1>
                <p className="text-lg text-dark-textSecondary max-w-2xl mx-auto">
                  Set your default preferences. You can always change these later.
                </p>
            </div>

              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-8 space-y-6">
                {/* Auto-Draft */}
                <div className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex-1">
                    <h3 className="font-normal text-gray-900 mb-1">Auto-Draft Mode</h3>
                    <p className="text-sm text-dark-textSecondary">
                      Automatically process new uploads from your master channel
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                      checked={autoDraft}
                      onChange={(e) => setAutoDraft(e.target.checked)}
                    className="sr-only peer"
                  />
                    <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

                {/* Tone Match */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  <h3 className="font-normal text-gray-900">Tone Match</h3>
                  <p className="text-sm text-dark-textSecondary">How closely should translations match the original tone?</p>
                  <div className="flex gap-3">
                    {(["strict", "loose"] as const).map((option) => (
                    <button
                        key={option}
                        onClick={() => setToneMatch(option)}
                        className={`flex-1 px-4 py-3 rounded-xl font-medium border-2 transition-all ${
                          toneMatch === option
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

                {/* Vocabulary */}
                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  <h3 className="font-normal text-gray-900">Vocabulary Style</h3>
                  <p className="text-sm text-dark-textSecondary">Choose the language style for translations</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["genz", "professional", "neutral"] as const).map((option) => (
                    <button
                        key={option}
                        onClick={() => setVocabulary(option)}
                        className={`px-4 py-3 rounded-xl font-medium border-2 transition-all ${
                          vocabulary === option
                            ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {option === "genz" ? "Gen Z" : option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

              <div className="flex justify-between mt-8">
            <button
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 text-dark-textSecondary hover:text-gray-900 font-medium"
            >
                  <ArrowRight className="h-5 w-5 rotate-180" />
              Back
            </button>

                <button
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="inline-flex items-center gap-2 bg-dark-card text-gray-900 px-8 py-3 rounded-full text-lg font-normal hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {savingPreferences ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Complete Setup
                    </>
                  )}
                </button>
        </div>
      </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
