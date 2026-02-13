"use client";

import React, { useState, useEffect } from "react";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTranscriptProps {
  title: string;
  text: string;
  languageCode?: string;
  onSave: (newText: string) => Promise<void>;
  theme: string;
  accentColor?: string;
  className?: string;
}

export function EditableTranscript({
  title,
  text,
  languageCode,
  onSave,
  theme,
  accentColor = "#FFC107",
  className
}: EditableTranscriptProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDark = theme === "dark";

  // Update local state when prop changes
  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(text);
    setError(null);
  };

  const handleSave = async () => {
    if (editedText === text) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editedText);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to save:", err);
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn(
      "rounded-lg p-3 relative",
      !isEditing && (isDark ? "bg-white/5 border border-white/10" : "bg-gray-50 border border-gray-200"),
      isEditing && (isDark ? "bg-white/10 border-2 border-[#FFC107]/50" : "bg-yellow-50 border-2 border-yellow-300"),
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isDark ? "text-white/70" : "text-gray-600"
        )}>
          {title} {languageCode && `(${languageCode.toUpperCase()})`}
        </h4>

        {!isEditing ? (
          <button
            onClick={handleEdit}
            className={cn(
              "p-1.5 rounded-md transition-all",
              isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-gray-200 text-gray-400 hover:text-gray-700"
            )}
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className={cn(
                "p-1.5 rounded-md transition-all",
                isDark ? "hover:bg-white/10 text-white/50 hover:text-white" : "hover:bg-gray-200 text-gray-400 hover:text-gray-700",
                isSaving && "opacity-50 cursor-not-allowed"
              )}
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || editedText === text}
              className={cn(
                "p-1.5 rounded-md transition-all",
                "bg-[#FFC107] text-black hover:bg-[#FFC107]/90",
                (isSaving || editedText === text) && "opacity-50 cursor-not-allowed"
              )}
              title="Save"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {!isEditing ? (
        <div className={cn(
          "text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap",
          isDark ? "text-white/80" : "text-gray-700"
        )}>
          {text || "No text available"}
        </div>
      ) : (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className={cn(
            "w-full text-xs leading-relaxed min-h-[160px] p-2 rounded border resize-y",
            isDark
              ? "bg-white/5 border-white/20 text-white focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]"
              : "bg-white border-gray-300 text-gray-900 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400",
            "focus:outline-none"
          )}
          placeholder="Enter text..."
          disabled={isSaving}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className={cn(
          "mt-2 p-2 rounded text-xs",
          isDark ? "bg-red-500/10 border border-red-500/20 text-red-400" : "bg-red-50 border border-red-200 text-red-600"
        )}>
          {error}
        </div>
      )}

      {/* Character Count (when editing) */}
      {isEditing && (
        <div className={cn(
          "mt-2 text-[10px] text-right",
          isDark ? "text-white/40" : "text-gray-500"
        )}>
          {editedText.length} characters
          {editedText !== text && (
            <span className="ml-2 text-[#FFC107]">• Modified</span>
          )}
        </div>
      )}
    </div>
  );
}
