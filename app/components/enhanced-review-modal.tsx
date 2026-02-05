'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/lib/DemoContext';

interface EnhancedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    jobId: string;
    title: string;
    titleTranslated?: string;
    description?: string;
    descriptionTranslated?: string;
    originalVideoUrl?: string;  // Original English video
    videoUrl?: string;           // Dubbed video
    audioUrl?: string;           // Dubbed audio
    originalLanguage?: string;
    targetLanguage?: string;
  };
}

export function EnhancedReviewModal({ isOpen, onClose, video }: EnhancedReviewModalProps) {
  const { updateVideoState, pauseJob, stopJob } = useDemo();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await updateVideoState(video.id, video.jobId, video.targetLanguage || 'es', 'live');
      onClose();
    } catch (error) {
      console.error('Failed to approve:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePause = async () => {
    setIsSubmitting(true);
    try {
      await pauseJob(video.id, video.jobId, video.targetLanguage || 'es');
      onClose();
    } catch (error) {
      console.error('Failed to pause:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStop = async () => {
    setIsSubmitting(true);
    try {
      await stopJob(video.id, video.jobId, video.targetLanguage || 'es');
      onClose();
    } catch (error) {
      console.error('Failed to stop:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Review Dubbed Video</h2>
            <p className="text-sm text-gray-500 mt-1">
              {video.originalLanguage?.toUpperCase() || 'EN'} → {video.targetLanguage?.toUpperCase() || 'ES'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Original Video */}
          {video.originalVideoUrl && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Original Video ({video.originalLanguage?.toUpperCase() || 'EN'})</h3>
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  controls
                  className="w-full h-full"
                  src={video.originalVideoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Dubbed Video */}
          {video.videoUrl && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Dubbed Video ({video.targetLanguage?.toUpperCase() || 'ES'})</h3>
              <div className="bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  controls
                  className="w-full h-full"
                  src={video.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Audio Preview */}
          {video.audioUrl && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Dubbed Audio Track</h3>
              <audio
                controls
                className="w-full"
                src={video.audioUrl}
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Title</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{video.title}</p>
            </div>

            {video.titleTranslated && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Translated Title</h3>
                <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                  {video.titleTranslated}
                </p>
              </div>
            )}

            {video.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Original Description</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{video.description}</p>
              </div>
            )}

            {video.descriptionTranslated && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Translated Description</h3>
                <p className="text-gray-700 bg-green-50 p-3 rounded border border-green-200 text-sm">
                  {video.descriptionTranslated}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t px-6 py-4 flex items-center justify-between bg-gray-50 sticky bottom-0">
          <div className="flex gap-3">
            <Button
              onClick={handlePause}
              variant="outline"
              disabled={isSubmitting}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
            >
              ⏸ Pause
            </Button>
            <Button
              onClick={handleStop}
              variant="outline"
              disabled={isSubmitting}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              ⏹ Stop
            </Button>
          </div>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            ✓ Approve & Publish
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
