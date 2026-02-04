"use client";

import React, { useMemo } from 'react';
import { useTheme } from '@/lib/useTheme';
import ReactFlow, {
    Node,
    Edge,
    Background,
    BackgroundVariant,
    MarkerType,
    Position,
    Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    X,
    CheckCircle,
    FileText,
    Video,
    Image as ImageIcon,
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

interface WorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    workflowState: JobWorkflowState;
    jobStatus: string;
    targetLanguages: string[];
    channelName?: string;
    videoTitle?: string;
    videoThumbnail?: string;
    onApprove?: (language: string) => void;
    onReject?: (language: string) => void;
    onRetry?: () => void;
    onPreview?: () => void;
}

// Custom node component for workflow stages
const WorkflowStageNode = ({ data }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const getStatusColors = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    border: 'border-emerald-500/50',
                    bg: isDark ? 'bg-emerald-500/5' : 'bg-emerald-50',
                    text: 'text-emerald-500',
                    pulse: 'bg-emerald-500',
                    badge: 'bg-emerald-500/10 text-emerald-500'
                };
            case 'processing':
                return {
                    border: 'border-blue-500/50',
                    bg: isDark ? 'bg-blue-500/5' : 'bg-blue-50',
                    text: 'text-blue-500',
                    pulse: 'bg-blue-500 animate-pulse',
                    badge: 'bg-blue-500/10 text-blue-500'
                };
            case 'failed':
                return {
                    border: 'border-red-500/50',
                    bg: isDark ? 'bg-red-500/5' : 'bg-red-50',
                    text: 'text-red-500',
                    pulse: 'bg-red-500',
                    badge: 'bg-red-500/20 text-red-500'
                };
            case 'review':
                return {
                    border: 'border-amber-500/50',
                    bg: isDark ? 'bg-amber-500/5' : 'bg-amber-50',
                    text: 'text-amber-500',
                    pulse: 'bg-amber-500 animate-pulse',
                    badge: 'bg-amber-500/10 text-amber-500'
                };
            default:
                return {
                    border: isDark ? 'border-gray-800' : 'border-gray-200',
                    bg: isDark ? 'bg-gray-900/40' : 'bg-gray-50',
                    text: isDark ? 'text-gray-400' : 'text-gray-500',
                    pulse: 'bg-gray-300',
                    badge: isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
                };
        }
    };

    const colors = getStatusColors(data.status);
    const Icon = data.icon;

    return (
        <div className={`${isDark ? 'bg-[#1a1c20] border-gray-800' : 'bg-white border-gray-200'} border rounded-xl overflow-hidden shadow-md w-[180px] transition-all hover:shadow-lg group relative`}>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-500 !border-none !-translate-x-1" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-500 !border-none !translate-x-1" />

            {/* Inner Content */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <span className={`p-1 px-2 rounded-md text-[8px] font-bold uppercase tracking-wide ${colors.badge}`}>
                        {data.category || 'Workflow'}
                    </span>
                    <div className={`w-1.5 h-1.5 rounded-full ${colors.pulse}`} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${colors.badge}`}>
                        <Icon className="w-3 h-3" />
                    </div>
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'} truncate flex-1`}>{data.label}</h4>
                </div>

                {data.imageUrl && (
                    <div className="aspect-[2/1] relative bg-gray-100 dark:bg-black/20 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800">
                        <img src={data.imageUrl} alt={data.label} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Footer / Status */}
            <div className={`${isDark ? 'bg-black/20 border-gray-800/50' : 'bg-gray-50/50 border-gray-100'} p-2 flex justify-center items-center border-t`}>
                <span className={`text-[9px] font-bold uppercase ${colors.text}`}>{data.status || 'Pending'}</span>
            </div>

            {/* Completion Checkmark Overlay */}
            {data.status === 'completed' && (
                <div className="absolute top-2 right-2 pointer-events-none">
                    <div className="bg-emerald-500 rounded-full p-0.5 shadow-lg">
                        <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}

            {/* Action Buttons for Review Status */}
            {data.status === 'review' && data.showActions && (
                <div className={`flex gap-1 p-2 border-t ${isDark ? 'border-gray-800 bg-black/40' : 'border-gray-100 bg-white'}`}>
                    <button
                        onClick={() => data.onApprove?.()}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg text-[9px] font-bold transition-colors shadow-sm"
                    >
                        <ThumbsUp className="w-2.5 h-2.5" />
                        APPROVE
                    </button>
                    <button
                        onClick={() => data.onReject?.()}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg text-[9px] font-bold transition-colors shadow-sm"
                    >
                        <ThumbsDown className="w-2.5 h-2.5" />
                        REJECT
                    </button>
                </div>
            )}
        </div>
    );
};

export function WorkflowModal({
    isOpen,
    onClose,
    jobId,
    workflowState,
    jobStatus,
    targetLanguages,
    channelName,
    videoTitle,
    videoThumbnail,
    onApprove,
    onReject,
    onRetry,
    onPreview
}: WorkflowModalProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-[#0f0f10]" : "bg-gray-50";
    const cardClass = isDark ? "bg-[#1a1c20]" : "bg-white";
    const borderClass = isDark ? "border-gray-800" : "border-gray-200";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-gray-400" : "text-gray-500";

    const nodeTypes = useMemo(() => ({
        workflowStage: WorkflowStageNode,
    }), []);

    // Determine status for grouped nodes
    const translationStatus = useMemo(() => {
        const translations = Object.values(workflowState.translations || {});
        if (translations.some((t: any) => t.title_status === 'processing')) return 'processing';
        if (translations.length > 0 && translations.every((t: any) => t.title_status === 'completed')) return 'completed';
        if (workflowState.approval_status?.requires_review) return 'review';
        return 'pending';
    }, [workflowState.translations, workflowState.approval_status]);

    const assetsStatus = useMemo(() => {
        const thumbnails = Object.values(workflowState.thumbnails || {});
        if (thumbnails.some((t: any) => t.status === 'generating')) return 'processing';
        if (thumbnails.length > 0 && thumbnails.every((t: any) => t.status === 'completed')) return 'completed';
        return 'pending';
    }, [workflowState.thumbnails]);

    const dubbingStatus = useMemo(() => {
        const dubbing = Object.values(workflowState.video_dubbing || {});
        if (dubbing.some((t: any) => t.status !== 'completed' && t.status !== 'failed' && t.status !== 'pending')) return 'processing';
        if (dubbing.length > 0 && dubbing.every((t: any) => t.status === 'completed')) return 'completed';
        if (dubbing.some((t: any) => t.status === 'failed')) return 'failed';
        return 'pending';
    }, [workflowState.video_dubbing]);

    // Create nodes and edges for React Flow
    const { nodes, edges } = useMemo(() => {
        const flowNodes: Node[] = [
            {
                id: 'metadata',
                type: 'workflowStage',
                position: { x: 0, y: 150 },
                data: {
                    icon: FileText,
                    label: 'Source Video',
                    category: 'INPUT',
                    imageUrl: videoThumbnail,
                    status: workflowState.metadata_extraction?.status || 'pending',
                },
            },
            {
                id: 'translation',
                type: 'workflowStage',
                position: { x: 250, y: 0 },
                data: {
                    icon: Globe,
                    label: 'Translation',
                    category: 'PROCESS',
                    imageUrl: '/workflow-translation.png',
                    status: translationStatus,
                    showActions: translationStatus === 'review',
                    onApprove: () => onApprove?.('all'),
                    onReject: () => onReject?.('all'),
                },
            },
            {
                id: 'assets',
                type: 'workflowStage',
                position: { x: 250, y: 300 },
                data: {
                    icon: ImageIcon,
                    label: 'Assets',
                    category: 'ASSET',
                    imageUrl: '/workflow-assets.png',
                    status: assetsStatus,
                },
            },
            {
                id: 'dubbing',
                type: 'workflowStage',
                position: { x: 500, y: 150 },
                data: {
                    icon: Video,
                    label: 'Dubbing',
                    category: 'ENGINE',
                    imageUrl: '/workflow-dubbing.png',
                    status: dubbingStatus,
                },
            },
            {
                id: 'distribution',
                type: 'workflowStage',
                position: { x: 750, y: 150 },
                data: {
                    icon: Sparkles,
                    label: 'Publishing',
                    category: 'OUTPUT',
                    imageUrl: videoThumbnail,
                    status: jobStatus === 'completed' ? 'completed' : 'pending',
                },
            },
        ];

        const flowEdges: Edge[] = [
            {
                id: 'e-metadata-translation',
                source: 'metadata',
                target: 'translation',
                type: 'smoothstep',
                animated: translationStatus === 'processing',
                style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-metadata-assets',
                source: 'metadata',
                target: 'assets',
                type: 'smoothstep',
                animated: assetsStatus === 'processing',
                style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-translation-dubbing',
                source: 'translation',
                target: 'dubbing',
                type: 'smoothstep',
                animated: dubbingStatus === 'processing' && translationStatus === 'completed',
                style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-assets-dubbing',
                source: 'assets',
                target: 'dubbing',
                type: 'smoothstep',
                animated: dubbingStatus === 'processing' && assetsStatus === 'completed',
                style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-dubbing-distribution',
                source: 'dubbing',
                target: 'distribution',
                type: 'smoothstep',
                animated: jobStatus === 'processing' && dubbingStatus === 'completed',
                style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
        ];

        return { nodes: flowNodes, edges: flowEdges };
    }, [workflowState, translationStatus, assetsStatus, dubbingStatus, jobStatus, onApprove, onReject, videoThumbnail]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`relative w-full max-w-6xl h-[85vh] ${cardClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-100 opacity-100 transition-all duration-300 animate-in fade-in zoom-in-95`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${borderClass} flex items-center justify-between flex-shrink-0`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-olleey-yellow/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-olleey-yellow" />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${textClass}`}>Workflow Pipeline</h3>
                            <p className={`text-xs ${textSecondaryClass}`}>{targetLanguages.length} language{targetLanguages.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 ${textSecondaryClass} hover:${textClass} hover:bg-white/5 rounded-full transition-all`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Sub-Header / Context */}
                {(channelName || videoTitle) && (
                    <div className={`px-6 py-3 ${bgClass} border-b ${borderClass} flex items-center gap-6 text-sm flex-shrink-0`}>
                        {videoTitle && (
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Play className={`w-4 h-4 ${textSecondaryClass} flex-shrink-0`} />
                                <span className={`font-medium ${textClass} truncate`}>{videoTitle}</span>
                            </div>
                        )}
                        {channelName && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Youtube className={`w-4 h-4 ${textSecondaryClass}`} />
                                <span className={`${textSecondaryClass}`}>{channelName}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* React Flow Content */}
                <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            fitView
                            fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                            attributionPosition="bottom-left"
                            proOptions={{ hideAttribution: true }}
                            nodesDraggable={false}
                            nodesConnectable={false}
                            elementsSelectable={false}
                            minZoom={0.1}
                            maxZoom={2}
                        >
                            <Background color={isDark ? "#1a1c20" : "#f1f5f9"} gap={20} variant={BackgroundVariant.Dots} />
                        </ReactFlow>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex-shrink-0 ${cardClass} border-t ${borderClass} px-6 py-4 flex items-center justify-end gap-3`}>
                    <Button
                        variant="outline"
                        className={`gap-2 ${isDark ? 'border-gray-700 hover:bg-gray-800 text-white' : ''}`}
                        onClick={onRetry}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </Button>
                    <Button
                        className="gap-2 bg-olleey-yellow text-black hover:bg-yellow-500"
                        onClick={onPreview}
                        disabled={jobStatus !== 'completed' && jobStatus !== 'waiting_approval'}
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Preview Result
                    </Button>
                </div>
            </div>
        </div>
    );
}
