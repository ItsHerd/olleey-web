import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/lib/useTheme';
import {
    X,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Video,
    Image as ImageIcon,
    Mic,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Play,
    Globe,
    Youtube
} from 'lucide-react';
import { JobWorkflowState } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getLanguageFlag } from '@/lib/languages';

interface WorkflowGraphSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    workflowState: JobWorkflowState;
    jobStatus: string;
    targetLanguages: string[];
    channelName?: string;
    videoTitle?: string;
    onApprove?: (language: string) => void;
    onReject?: (language: string) => void;
    onRetry?: () => void;
    onPreview?: () => void;
}

export function WorkflowGraphSidebar({
    isOpen,
    onClose,
    jobId,
    workflowState,
    jobStatus,
    targetLanguages,
    channelName,
    videoTitle,
    onApprove,
    onReject,
    onRetry,
    onPreview
}: WorkflowGraphSidebarProps) {
    const { theme } = useTheme();
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && isOpen) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // Theme classes
    const panelBg = theme === "light" ? "bg-white" : "bg-[#111]";
    const textPrimary = theme === "light" ? "text-gray-900" : "text-white";
    const textSecondary = theme === "light" ? "text-gray-500" : "text-gray-400";
    const border = theme === "light" ? "border-gray-200" : "border-gray-800";

    // Helper to determine node status color
    const getNodeStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'review': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-gray-400 bg-gray-50 border-gray-200';
        }
    };

    const Node = ({
        icon: Icon,
        title,
        subtitle,
        status = 'pending',
        isLast = false,
        isParallel = false,
        showActions = false
    }: {
        icon: any,
        title: string,
        subtitle?: string,
        status?: string,
        isLast?: boolean,
        isParallel?: boolean,
        showActions?: boolean
    }) => {
        const colorClass = getNodeStatusColor(status);
        const isCompleted = status === 'completed';

        return (
            <div className={`relative flex gap-4 ${isParallel ? 'flex-1 min-w-0' : 'w-full'}`}>
                {/* Connector Line - Adjusted alignment */}
                {!isLast && !isParallel && (
                    <div className="absolute left-[21px] top-[44px] bottom-[-20px] w-0.5 bg-gray-200 dark:bg-gray-800" />
                )}

                {/* Node Icon */}
                <div className={`relative z-10 w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                    {isCompleted && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white dark:border-black">
                            <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={`flex-1 pt-1 pb-8 ${!isLast && !isParallel ? 'border-b border-dashed border-gray-100 dark:border-gray-800' : ''}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className={`font-semibold text-sm ${textPrimary}`}>{title}</h4>
                            <p className={`text-xs ${textSecondary} mt-0.5`}>{subtitle || 'Waiting to start...'}</p>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass}`}>
                            {status}
                        </div>
                    </div>

                    {/* Actions - Always show if 'review' status or explicitly requested */}
                    {(showActions || status === 'review') && (
                        <div className="flex gap-2 mt-3 animate-in fade-in slide-in-from-top-1 duration-300">
                            <button
                                onClick={() => onApprove?.('all')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-200 shadow-sm"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                                Approve
                            </button>
                            <button
                                onClick={() => onReject?.('all')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200 shadow-sm"
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                                Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Determine status for grouped nodes
    const translationStatus = Object.values(workflowState.translations).some(t => t.title_status === 'processing') ? 'processing' :
        Object.values(workflowState.translations).every(t => t.title_status === 'completed') ? 'completed' :
            workflowState.approval_status.requires_review ? 'review' : 'pending';

    const assetsStatus = Object.values(workflowState.thumbnails).some(t => t.status === 'generating') ? 'processing' :
        Object.values(workflowState.thumbnails).every(t => t.status === 'completed') ? 'completed' : 'pending';

    return (
        <div className={`absolute top-0 right-0 h-full w-[450px] ${panelBg} shadow-xl z-[50] border-l ${border} flex flex-col transition-transform duration-300 ease-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`} ref={sidebarRef}>

            {/* Header */}
            <div className={`p-6 border-b ${border}`}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-mono p-1 rounded bg-gray-100 dark:bg-gray-800 ${textSecondary}`}>{jobId.substring(0, 8)}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${jobStatus === 'completed' ? 'text-emerald-500' : 'text-blue-500'}`}>{jobStatus}</span>
                        </div>
                        <h2 className={`text-lg font-bold ${textPrimary} leading-tight`}>{videoTitle || "Untitled Job"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors ${textSecondary}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {/* Channel Info */}
                    <div className="flex items-center gap-2">
                        <span className={`p-1 rounded bg-red-50 text-red-600`}>
                            <Youtube className="w-3.5 h-3.5" />
                        </span>
                        <span className={`text-sm font-medium ${textPrimary}`}>{channelName || "Unknown Channel"}</span>
                    </div>

                    {/* Languages Info */}
                    <div className="flex items-center gap-2">
                        <span className={`p-1 rounded bg-blue-50 text-blue-600`}>
                            <Globe className="w-3.5 h-3.5" />
                        </span>
                        <div className="flex gap-1.5 flex-wrap">
                            {targetLanguages.map(lang => (
                                <span key={lang} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 ${textSecondary} border ${border}`}>
                                    <span>{getLanguageFlag(lang)}</span>
                                    <span className="uppercase">{lang}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visualization Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Pipeline Stages</h3>
                        <span className="text-[10px] text-gray-400">Time elapsed: 12m 30s</span>
                    </div>

                    <div className="space-y-2 relative">
                        {/* Metadata Node */}
                        <Node
                            icon={FileText}
                            title="Metadata Extraction"
                            subtitle="Extracting title & description"
                            status={workflowState.metadata_extraction.status}
                        />

                        {/* Parallel Connector Line Logic */}
                        <div className="relative pl-[22px] pb-6 border-l-2 border-dashed border-gray-200 dark:border-gray-800 ml-[23px] -mt-6 pt-6">
                            <div className="absolute top-6 left-0 w-4 border-t-2 border-dashed border-gray-200 dark:border-gray-800"></div>
                        </div>

                        {/* Parallel Group */}
                        <div className="flex gap-2 mb-4 -mt-4">
                            <div className="flex-1 p-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-gray-800">
                                <div className="flex flex-col gap-4">
                                    <Node
                                        icon={Mic}
                                        title="Translation"
                                        subtitle="Multi-lingual scripts"
                                        status={translationStatus}
                                        isParallel={true}
                                        showActions={true}
                                    />
                                    <div className="w-full h-px bg-gray-200 dark:bg-gray-700" />
                                    <Node
                                        icon={ImageIcon}
                                        title="Assets"
                                        subtitle="Thumbnails"
                                        status={assetsStatus}
                                        isParallel={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Rejoin Line */}
                        <div className="relative pl-[22px] -mt-4 mb-2">
                            <div className="absolute -top-4 left-[23px] h-4 border-l-2 border-dashed border-gray-200 dark:border-gray-800"></div>
                        </div>

                        {/* Dubbing Node */}
                        <Node
                            icon={Video}
                            title="AI Dubbing"
                            subtitle="Voice cloning & lip-sync"
                            status={Object.values(workflowState.video_dubbing).some(t => t.status !== 'completed' && t.status !== 'failed' && t.status !== 'pending') ? 'processing' :
                                Object.values(workflowState.video_dubbing).every(t => t.status === 'completed') ? 'completed' : 'pending'}
                        />

                        {/* Final Node */}
                        <Node
                            icon={Sparkles}
                            title="Distribution"
                            subtitle="Ready for publishing"
                            status={jobStatus === 'completed' ? 'completed' : 'pending'}
                            isLast={true}
                        />
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className={`p-4 border-t ${border} bg-gray-50/50 dark:bg-[#151515]`}>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={onRetry}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry Job
                    </Button>
                    <Button
                        className="flex-1 gap-2 bg-olleey-yellow text-black hover:bg-yellow-500"
                        onClick={onPreview}
                        disabled={jobStatus !== 'completed' && jobStatus !== 'waiting_approval'}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Preview
                    </Button>
                </div>
            </div>
        </div>

    );
}
