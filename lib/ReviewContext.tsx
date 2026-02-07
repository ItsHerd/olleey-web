'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jobsAPI, type LocalizationInfo } from './api';
import { useToast } from '@/components/ui/use-toast';
import { logger } from './logger';
import { LANGUAGE_OPTIONS, getFakeLocalizedText } from './languages';
import { useDemo } from './DemoContext';

interface QuickCheckState {
    isOpen: boolean;
    videoId: string | null;
    languageCode: string | null;
    originalVideoUrl?: string;
    dubbedVideoUrl?: string;
    videoTitle?: string;
    videoDescription?: string;
    thumbnailUrl?: string;
    localizedTitle?: string;
    localizedDescription?: string;
    isApproved?: boolean;
    approvedAt?: string;
    status?: 'queued' | 'live' | 'draft' | 'processing' | 'not-started' | 'failed' | 'completed' | 'pending' | 'downloading' | 'voice_cloning' | 'lip_sync' | 'uploading' | 'waiting_approval' | 'ready';
}

interface ReviewContextType {
    quickCheckState: QuickCheckState;
    openReview: (params: {
        videoId: string;
        languageCode: string;
        originalVideoUrl?: string;
        dubbedVideoUrl?: string;
        videoTitle?: string;
        videoDescription?: string;
        thumbnailUrl?: string;
        localizedTitle?: string;
        localizedDescription?: string;
        isApproved?: boolean;
        approvedAt?: string;
        status?: 'queued' | 'live' | 'draft' | 'processing' | 'not-started' | 'failed' | 'completed' | 'pending' | 'downloading' | 'voice_cloning' | 'lip_sync' | 'uploading' | 'waiting_approval' | 'ready';
    }) => void;
    closeReview: () => void;
    handleApprove: () => Promise<void>;
    handleFlag: (reason: string) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const router = useRouter();
    const { isDemoMode, updateVideoState } = useDemo();
    const [quickCheckState, setQuickCheckState] = useState<QuickCheckState>({
        isOpen: false,
        videoId: null,
        languageCode: null,
    });

    const openReview = useCallback((params: any) => {
        setQuickCheckState({
            isOpen: true,
            ...params,
        });

        // Navigate based on status state
        const processingStatuses = ['queued', 'processing', 'downloading', 'transcribing', 'voice_cloning', 'lip_sync', 'pending', 'uploading'];

        if (params.isApproved || params.status === 'live' || params.status === 'ready') {
            router.push(`/app?page=Preview&video_id=${params.videoId}&lang=${params.languageCode || 'es'}`, { scroll: false });
        } else if (processingStatuses.includes(params.status || '')) {
            router.push(`/app?page=Processing&video_id=${params.videoId}&lang=${params.languageCode || 'es'}`, { scroll: false });
        } else {
            router.push(`/app?page=Review Hub&video_id=${params.videoId}&lang=${params.languageCode || 'es'}`, { scroll: false });
        }
    }, [router]);

    const closeReview = useCallback(() => {
        setQuickCheckState(prev => ({ ...prev, isOpen: false }));
        // Optionally navigate back if we were on the Review Hub page
        router.push('/app?page=All Media', { scroll: false });
    }, [router]);

    const handleApprove = useCallback(async () => {
        const { videoId, languageCode } = quickCheckState;
        if (!videoId) return;

        try {
            if (isDemoMode && languageCode) {
                await updateVideoState(videoId, videoId, languageCode, 'live');
            } else {
                await jobsAPI.approveJob(videoId);
            }

            toast("Approved! Publishing to channel...", "success");

            // Refresh data via global event
            window.dispatchEvent(new CustomEvent('olleey-refresh'));

            closeReview();
        } catch (err: any) {
            logger.error("ReviewContext", "Failed to approve job", err);
            toast(err.message || "Failed to approve", "error");
        }
    }, [quickCheckState, isDemoMode, updateVideoState, toast, closeReview]);

    const handleFlag = useCallback((reason: string) => {
        logger.info("ReviewContext", `Flagged video ${quickCheckState.videoId} (${quickCheckState.languageCode}): ${reason}`);
        closeReview();
        toast("Optimization request submitted", "info");
    }, [quickCheckState, closeReview, toast]);

    return (
        <ReviewContext.Provider value={{
            quickCheckState,
            openReview,
            closeReview,
            handleApprove,
            handleFlag,
        }}>
            {children}
        </ReviewContext.Provider>
    );
}

export const useReview = () => {
    const context = useContext(ReviewContext);
    if (!context) {
        throw new Error('useReview must be used within ReviewProvider');
    }
    return context;
};
