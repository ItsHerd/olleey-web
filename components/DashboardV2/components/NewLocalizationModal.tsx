"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Youtube,
  Globe,
  Mic,
  Radio,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGE_OPTIONS } from "@/lib/languages";

interface NewLocalizationModalProps {
  open: boolean;
  onClose: () => void;
  theme: string;
}

type Step = "source" | "languages" | "voices" | "distribution" | "confirm";

export function NewLocalizationModal({
  open,
  onClose,
  theme
}: NewLocalizationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>("source");
  const [sourceType, setSourceType] = useState<"upload" | "youtube">("youtube");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [useTemplate, setUseTemplate] = useState(false);

  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  const steps: Step[] = ["source", "languages", "voices", "distribution", "confirm"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    // Create job logic here
    console.log("Creating job...", {
      sourceType,
      sourceUrl,
      selectedLanguages,
    });
    onClose();
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev =>
      prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${cardBgClass} max-w-3xl w-full border ${isDark ? "border-white/10" : "border-gray-200"} rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? "border-white/10" : "border-gray-200"} flex items-center justify-between`}>
          <h2 className="text-2xl font-bold">New Localization</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`h-8 w-8 p-0 ${!isDark && "hover:bg-gray-100"}`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content wrapper */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx <= currentStepIndex
                    ? "bg-[#FFC107] text-black"
                    : `${isDark ? "bg-gray-800 text-gray-500" : "bg-gray-200 text-gray-400"}`
                    }`}
                >
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-12 ${idx < currentStepIndex ? "bg-[#FFC107]" : `${isDark ? "bg-gray-800" : "bg-gray-200"}`}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {currentStep === "source" && (
                <SourceStep
                  sourceType={sourceType}
                  onSourceTypeChange={setSourceType}
                  sourceUrl={sourceUrl}
                  onSourceUrlChange={setSourceUrl}
                  theme={theme}
                />
              )}

              {currentStep === "languages" && (
                <LanguagesStep
                  selectedLanguages={selectedLanguages}
                  onToggleLanguage={toggleLanguage}
                  theme={theme}
                />
              )}

              {currentStep === "voices" && (
                <VoicesStep selectedLanguages={selectedLanguages} theme={theme} />
              )}

              {currentStep === "distribution" && (
                <DistributionStep selectedLanguages={selectedLanguages} theme={theme} />
              )}

              {currentStep === "confirm" && (
                <ConfirmStep
                  sourceUrl={sourceUrl}
                  languages={selectedLanguages}
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </div>

        {/* Actions */}
        <div className={`p-6 border-t ${isDark ? "border-white/10" : "border-gray-200"} flex items-center justify-between`}>
          <Button
            variant="outline"
            onClick={currentStepIndex === 0 ? onClose : handleBack}
          >
            {currentStepIndex === 0 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={currentStepIndex === steps.length - 1 ? handleSubmit : handleNext}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold gap-2"
            disabled={
              (currentStep === "source" && !sourceUrl) ||
              (currentStep === "languages" && selectedLanguages.length === 0)
            }
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4" />
                Create Job
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step Components
function SourceStep({
  sourceType,
  onSourceTypeChange,
  sourceUrl,
  onSourceUrlChange,
  theme
}: any) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#0F0F0F]" : "bg-gray-50";

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Select Video Source
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSourceTypeChange("youtube")}
            className={`${cardBgClass} border-2 ${sourceType === "youtube" ? "border-[#FFC107]" : `${isDark ? "border-white/10" : "border-gray-200"}`
              } rounded-xl p-6 text-center transition-colors`}
          >
            <Youtube className="w-12 h-12 mx-auto mb-3 text-red-500" />
            <div className="font-semibold mb-1">YouTube URL</div>
            <div className="text-sm text-gray-500">Import from YouTube</div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSourceTypeChange("upload")}
            className={`${cardBgClass} border-2 ${sourceType === "upload" ? "border-[#FFC107]" : `${isDark ? "border-white/10" : "border-gray-200"}`
              } rounded-xl p-6 text-center transition-colors`}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-[#FFC107]" />
            <div className="font-semibold mb-1">Upload Video</div>
            <div className="text-sm text-gray-500">Upload from computer</div>
          </motion.button>
        </div>
      </div>

      {sourceType === "youtube" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="youtube-url">YouTube URL</Label>
          <Input
            id="youtube-url"
            placeholder="https://youtube.com/watch?v=..."
            value={sourceUrl}
            onChange={(e) => onSourceUrlChange(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Paste a link to any public YouTube video
          </p>
        </motion.div>
      )}

      {sourceType === "upload" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${cardBgClass} border-2 border-dashed ${isDark ? "border-white/20" : "border-gray-300"} rounded-xl p-12 text-center`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <div className="font-semibold mb-2">Drag and drop video here</div>
          <div className="text-sm text-gray-500 mb-4">or click to browse</div>
          <Button variant="outline">Choose File</Button>
        </motion.div>
      )}
    </div>
  );
}

function LanguagesStep({ selectedLanguages, onToggleLanguage, theme }: any) {
  const isDark = theme === "dark";
  const popularLanguages = LANGUAGE_OPTIONS.slice(0, 12);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Select Target Languages
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Choose which languages you want to localize your video into
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {popularLanguages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggleLanguage(lang.code)}
            className={`p-4 rounded-lg border-2 transition-colors ${selectedLanguages.includes(lang.code)
              ? "border-[#FFC107] bg-[#FFC107]/10"
              : `${isDark ? "border-white/10" : "border-gray-200"}`
              }`}
          >
            <Globe className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium text-sm">{lang.name}</div>
          </motion.button>
        ))}
      </div>

      {selectedLanguages.length > 0 && (
        <div className="text-sm text-gray-500">
          {selectedLanguages.length} language{selectedLanguages.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

function VoicesStep({ selectedLanguages, theme }: any) {
  const isDark = theme === "dark";
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Assign Voices
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Choose which voice profile to use for each language
        </p>
      </div>

      <div className="space-y-3">
        {selectedLanguages.map((lang: string) => (
          <div key={lang} className={`flex items-center justify-between p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-[#FFC107]" />
              <span className="font-medium">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}</span>
            </div>
            <select className={`${isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-200"} border hover:border-olleey-yellow rounded px-3 py-1.5 text-xs outline-none focus:border-olleey-yellow transition-all cursor-pointer shadow-sm`}>
              <option>Default Voice</option>
              <option>Custom Voice Clone</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionStep({ selectedLanguages, theme }: any) {
  const isDark = theme === "dark";
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Distribution Targets
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Choose where each localized video should be published
        </p>
      </div>

      <div className="space-y-3">
        {selectedLanguages.map((lang: string) => (
          <div key={lang} className={`flex items-center justify-between p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-[#FFC107]" />
              <span className="font-medium">{LANGUAGE_OPTIONS.find(l => l.code === lang)?.name}</span>
            </div>
            <select className={`${isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-200"} border hover:border-olleey-yellow rounded px-3 py-1.5 text-xs outline-none focus:border-olleey-yellow transition-all cursor-pointer shadow-sm`}>
              <option>Main Channel (MLA)</option>
              <option>Spanish Channel</option>
              <option>French Channel</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmStep({ sourceUrl, languages, theme }: any) {
  const isDark = theme === "dark";
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-4 block">
          Confirm & Launch
        </Label>
        <p className="text-sm text-gray-500 mb-4">
          Review your localization job configuration
        </p>
      </div>

      <div className="space-y-4">
        <div className={`p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
          <div className="text-sm text-gray-500 mb-1">Source Video</div>
          <div className="font-medium truncate">{sourceUrl}</div>
        </div>

        <div className={`p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
          <div className="text-sm text-gray-500 mb-1">Target Languages</div>
          <div className="font-medium">{languages.length} languages selected</div>
        </div>

        <div className={`p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
          <div className="text-sm text-gray-500 mb-1">Estimated Cost</div>
          <div className="font-medium text-[#FFC107]">~${(languages.length * 8.5).toFixed(2)}</div>
        </div>

        <div className={`p-4 ${isDark ? "bg-[#0F0F0F]" : "bg-gray-100"} rounded-lg`}>
          <div className="text-sm text-gray-500 mb-1">Estimated Time</div>
          <div className="font-medium">~{languages.length * 5} minutes</div>
        </div>
      </div>
    </div>
  );
}
