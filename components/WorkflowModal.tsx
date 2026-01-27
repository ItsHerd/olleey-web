"use client";

import React, { useMemo } from 'react';
import { useTheme } from '@/lib/useTheme';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
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

interface WorkflowModalProps {
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

// Custom node component for workflow stages
const WorkflowStageNode = ({ data }: any) => {
    const { theme } = useTheme();
    const getStatusColor = (status: string) => {
        const isDark = theme === 'dark';
        switch (status) {
            case 'completed':
                return isDark
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-emerald-500 bg-emerald-50 text-emerald-700';
            case 'processing':
                return isDark
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-blue-500 bg-blue-50 text-blue-700';
            case 'failed':
                return isDark
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-red-500 bg-red-50 text-red-700';
            case 'review':
                return isDark
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-amber-500 bg-amber-50 text-amber-700';
            default:
                return isDark
                    ? 'border-gray-700 bg-gray-800/10 text-gray-400'
                    : 'border-gray-300 bg-gray-50 text-gray-500';
        }
    };

    const Icon = data.icon;
    const isCompleted = data.status === 'completed';
    const colorClass = getStatusColor(data.status);

    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} style={{ background: '#6b7280', opacity: 0 }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#6b7280', opacity: 0 }} />

            <div className={`relative ${theme === 'dark' ? 'bg-[#1a1c20] shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-white shadow-lg'} rounded-xl border-2 ${colorClass} p-4 min-w-[180px] transition-all duration-300`}>
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>{data.label}</h4>
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>{data.subtitle}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${colorClass}`}>
                    {data.status}
                </div>

                {/* Completion Checkmark */}
                {isCompleted && (
                    <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                )}

                {/* Action Buttons for Review Status */}
                {data.status === 'review' && data.showActions && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => data.onApprove?.()}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors border border-emerald-200"
                        >
                            <ThumbsUp className="w-3 h-3" />
                            Approve
                        </button>
                        <button
                            onClick={() => data.onReject?.()}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors border border-red-200"
                        >
                            <ThumbsDown className="w-3 h-3" />
                            Reject
                        </button>
                    </div>
                )}
            </div>
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
                position: { x: 400, y: 0 },
                data: {
                    icon: FileText,
                    label: 'Metadata Extraction',
                    subtitle: 'Extracting title & description',
                    status: workflowState.metadata_extraction?.status || 'pending',
                },
            },
            {
                id: 'translation',
                type: 'workflowStage',
                position: { x: 100, y: 200 },
                data: {
                    icon: Mic,
                    label: 'Translation',
                    subtitle: 'Multi-lingual scripts',
                    status: translationStatus,
                    showActions: translationStatus === 'review',
                    onApprove: () => onApprove?.('all'),
                    onReject: () => onReject?.('all'),
                },
            },
            {
                id: 'assets',
                type: 'workflowStage',
                position: { x: 400, y: 200 },
                data: {
                    icon: ImageIcon,
                    label: 'Assets',
                    subtitle: 'Thumbnails',
                    status: assetsStatus,
                },
            },
            {
                id: 'dubbing',
                type: 'workflowStage',
                position: { x: 700, y: 200 },
                data: {
                    icon: Video,
                    label: 'AI Dubbing',
                    subtitle: 'Voice cloning & lip-sync',
                    status: dubbingStatus,
                },
            },
            {
                id: 'distribution',
                type: 'workflowStage',
                position: { x: 400, y: 400 },
                data: {
                    icon: Sparkles,
                    label: 'Distribution',
                    subtitle: 'Ready for publishing',
                    status: jobStatus === 'completed' ? 'completed' : 'pending',
                },
            },
        ];

        const flowEdges: Edge[] = [
            {
                id: 'e-metadata-translation',
                source: 'metadata',
                target: 'translation',
                type: 'default',
                animated: translationStatus === 'processing',
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-metadata-assets',
                source: 'metadata',
                target: 'assets',
                type: 'default',
                animated: assetsStatus === 'processing',
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-metadata-dubbing',
                source: 'metadata',
                target: 'dubbing',
                type: 'default',
                animated: dubbingStatus === 'processing',
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-translation-distribution',
                source: 'translation',
                target: 'distribution',
                type: 'default',
                animated: false,
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-assets-distribution',
                source: 'assets',
                target: 'distribution',
                type: 'default',
                animated: false,
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
            {
                id: 'e-dubbing-distribution',
                source: 'dubbing',
                target: 'distribution',
                type: 'default',
                animated: false,
                style: { stroke: '#3b82f6', strokeWidth: 2.5 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            },
        ];

        return { nodes: flowNodes, edges: flowEdges };
    }, [workflowState, translationStatus, assetsStatus, dubbingStatus, jobStatus, onApprove, onReject]);

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
                            <h3 className={`text-lg font-bold ${textClass}`}>Job Workflow Execution</h3>
                            <p className={`text-xs ${textSecondaryClass}`}>Job ID: {jobId}</p>
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
                        {channelName && (
                            <div className="flex items-center gap-2">
                                <Youtube className={`w-4 h-4 ${textSecondaryClass}`} />
                                <span className={textSecondaryClass}>Channel:</span>
                                <span className={`font-medium ${textClass}`}>{channelName}</span>
                            </div>
                        )}
                        {videoTitle && (
                            <div className="flex items-center gap-2 max-w-md">
                                <FileText className={`w-4 h-4 ${textSecondaryClass}`} />
                                <span className={textSecondaryClass}>Video:</span>
                                <span className={`font-medium ${textClass} truncate`}>{videoTitle}</span>
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
                            <Background color={isDark ? "#333" : "#e5e7eb"} gap={16} />
                            <Controls className={isDark ? "bg-gray-800 border-gray-700 fill-white" : ""} />
                        </ReactFlow>
                    </div>
                </div>

                {/* Footer */}
                <div className={`flex-shrink-0 ${cardClass} border-t ${borderClass} px-6 py-4 flex items-center justify-between`}>
                    <p className={`text-sm ${textSecondaryClass}`}>
                        Pipeline visualization • {targetLanguages.length} target language{targetLanguages.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className={`gap-2 ${isDark ? 'border-gray-700 hover:bg-gray-800 text-white' : ''}`}
                            onClick={onRetry}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Job
                        </Button>
                        <Button
                            className="gap-2 bg-olleey-yellow text-black hover:bg-yellow-500"
                            onClick={onPreview}
                            disabled={jobStatus !== 'completed' && jobStatus !== 'waiting_approval'}
                        >
                            <Play className="w-4 h-4 fill-current" />
                            Preview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
