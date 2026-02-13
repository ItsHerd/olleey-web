"use client";

import React, { useState, useEffect } from "react";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { jobsAPI } from "@/lib/api";

interface TranscriptTabProps {
  jobId: string;
  languageCode?: string;
  theme: string;
}

interface Transcript {
  id: string;
  job_id: string;
  transcript_text: string;
  source_language: string;
  confidence_score?: number;
  word_timestamps?: any;
  created_at: string;
}

interface Translation {
  id: string;
  job_id: string;
  target_language: string;
  translated_text: string;
  translation_engine: string;
  confidence_score?: number;
  created_at: string;
}

export function TranscriptTab({ jobId, languageCode = "es", theme }: TranscriptTabProps) {
  const isDark = theme === "dark";
  const cardBgClass = isDark ? "bg-[#1A1A1A]" : "bg-white";

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch transcript
        const transcriptData = await jobsAPI.getJobTranscript(jobId);
        setTranscript(transcriptData);

        // Fetch translation for the specified language
        const translationData = await jobsAPI.getJobTranslation(jobId, languageCode);
        setTranslation(translationData);
      } catch (err: any) {
        console.error("Failed to fetch transcript/translation:", err);
        setError(err.message || "Failed to load transcript data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, languageCode]);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFC107] mx-auto mb-2" />
          <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-500"}`}>
            Loading transcript...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className={`${cardBgClass} border ${isDark ? "border-red-500/20" : "border-red-200"} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-500">Error Loading Transcript</h3>
          </div>
          <p className={`text-sm ${isDark ? "text-white/60" : "text-gray-600"}`}>{error}</p>
          <p className={`text-xs mt-2 ${isDark ? "text-white/40" : "text-gray-400"}`}>
            This may be because the job is still processing or the transcript hasn't been generated yet.
          </p>
        </div>
      </div>
    );
  }

  // Format transcript text with timestamps (if available)
  const formatTranscriptText = (text: string) => {
    // Split by newlines or periods for better readability
    const segments = text.split(/\n|(?<=\. )/);
    return segments.filter(s => s.trim()).map((segment, idx) => (
      <p key={idx} className="mb-2">
        <span className={`${isDark ? "text-gray-500" : "text-gray-400"} text-xs mr-2`}>
          [{String(idx * 5).padStart(2, '0')}:{String((idx * 5) % 60).padStart(2, '0')}]
        </span>
        {segment.trim()}
      </p>
    ));
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Source Transcript */}
        <div className={`${cardBgClass} border ${isDark ? "border-white/10" : "border-gray-200"} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              Source ({transcript?.source_language?.toUpperCase() || "EN"})
            </h3>
            {transcript?.confidence_score && (
              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}>
                {Math.round(transcript.confidence_score * 100)}% confidence
              </span>
            )}
          </div>
          <div className={`space-y-1 text-sm ${isDark ? "text-white/80" : "text-gray-700"} max-h-[500px] overflow-y-auto`}>
            {transcript?.transcript_text ? (
              formatTranscriptText(transcript.transcript_text)
            ) : (
              <p className={`${isDark ? "text-white/40" : "text-gray-400"} italic`}>
                No transcript available
              </p>
            )}
          </div>
        </div>

        {/* Translated Transcript */}
        <div className={`${cardBgClass} border ${isDark ? "border-white/10" : "border-gray-200"} rounded-lg p-6`}>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#FFC107]" />
            <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {translation?.target_language?.toUpperCase() || languageCode.toUpperCase()} Translation
            </h3>
            {translation?.confidence_score && (
              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-white/10 text-white/60" : "bg-gray-100 text-gray-600"}`}>
                {Math.round(translation.confidence_score * 100)}% confidence
              </span>
            )}
            {translation?.translation_engine && (
              <span className={`text-xs px-2 py-0.5 rounded ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                {translation.translation_engine}
              </span>
            )}
          </div>
          <div className={`space-y-1 text-sm ${isDark ? "text-white/80" : "text-gray-700"} max-h-[500px] overflow-y-auto`}>
            {translation?.translated_text ? (
              formatTranscriptText(translation.translated_text)
            ) : (
              <p className={`${isDark ? "text-white/40" : "text-gray-400"} italic`}>
                No translation available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
