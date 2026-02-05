"use client";

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/lib/useTheme';
import ReactFlow, {
    Node,
    Edge,
    Background,
    BackgroundVariant,
    MarkerType,
    Position,
    Handle,
    NodePositionChange,
    OnNodesChange,
    applyNodeChanges,
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
    Eye,
    Globe,
    Youtube,
    ShieldCheck,
    Bell,
    Lock,
    GitBranch,
    Plus,
    GripVertical,
    AlertTriangle,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { JobWorkflowState } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getLanguageFlag } from '@/lib/languages';

// Gate Types
export type GateType = 'deploy' | 'notification' | 'approval' | 'conditional';

export interface Gate {
    id: string;
    type: GateType;
    label: string;
    sourceId: string;  // Which stage this gate comes after
    targetId: string;  // Which stage this gate comes before
    config: {
        message?: string;
        recipients?: string[];
        condition?: string;
        enabled: boolean;
    };
}

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
            <div className={`${isDark ? 'bg-black/20 border-gray-800/50' : 'bg-gray-50/50 border-gray-100'} p-2 flex justify-between items-center border-t min-h-[32px]`}>
                <span className={`text-[9px] font-bold uppercase ${colors.text}`}>{data.status || 'Pending'}</span>
                {data.status !== 'pending' && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onPreview?.();
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[8px] font-bold transition-all shadow-sm
                            ${isDark 
                                ? 'bg-gray-800/40 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-600' 
                                : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <Eye className="w-2.5 h-2.5" />
                        PREVIEW
                    </button>
                )}
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

// Custom gate node component
const GateNode = ({ data }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const getGateConfig = (type: GateType) => {
        switch (type) {
            case 'deploy':
                return {
                    icon: ShieldCheck,
                    color: 'purple',
                    bgClass: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
                    borderClass: 'border-purple-500/50',
                    textClass: 'text-purple-500',
                    badgeClass: 'bg-purple-500/20 text-purple-400',
                    description: 'Deploy Gate'
                };
            case 'notification':
                return {
                    icon: Bell,
                    color: 'cyan',
                    bgClass: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50',
                    borderClass: 'border-cyan-500/50',
                    textClass: 'text-cyan-500',
                    badgeClass: 'bg-cyan-500/20 text-cyan-400',
                    description: 'Notification Gate'
                };
            case 'approval':
                return {
                    icon: Lock,
                    color: 'amber',
                    bgClass: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
                    borderClass: 'border-amber-500/50',
                    textClass: 'text-amber-500',
                    badgeClass: 'bg-amber-500/20 text-amber-400',
                    description: 'Approval Gate'
                };
            case 'conditional':
                return {
                    icon: GitBranch,
                    color: 'pink',
                    bgClass: isDark ? 'bg-pink-500/10' : 'bg-pink-50',
                    borderClass: 'border-pink-500/50',
                    textClass: 'text-pink-500',
                    badgeClass: 'bg-pink-500/20 text-pink-400',
                    description: 'Conditional Gate'
                };
        }
    };

    const config = getGateConfig(data.gateType);
    const Icon = config.icon;
    const isActive = data.config?.enabled;

    return (
        <div className={`${isDark ? 'bg-[#1a1c20]' : 'bg-white'} border-2 ${config.borderClass} rounded-lg overflow-hidden shadow-lg w-[140px] transition-all hover:shadow-xl group relative ${!isActive ? 'opacity-50 grayscale' : ''}`}>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-purple-500 !border-none !-translate-x-1" />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-purple-500 !border-none !translate-x-1" />

            {/* Enable/Disable Toggle Button - Top Right */}
            {data.onToggle && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onToggle();
                    }}
                    className={`absolute top-1 right-1 p-1.5 rounded-md ${isActive
                            ? `${config.bgClass} ${config.borderClass} border`
                            : `${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} border`
                        } hover:scale-110 transition-transform z-10 shadow-sm`}
                    title={isActive ? 'Disable gate' : 'Enable gate'}
                >
                    {isActive ? (
                        <CheckCircle className={`w-3.5 h-3.5 ${config.textClass}`} />
                    ) : (
                        <X className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    )}
                </button>
            )}

            {/* Gate Content */}
            <div className={`${config.bgClass} p-3 border-b ${config.borderClass}`}>
                <div className="flex flex-col items-center gap-2">
                    <div className={`p-2 rounded-lg ${config.badgeClass} relative`}>
                        <Icon className="w-5 h-5" />
                        {isActive && (
                            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-${config.color}-500 animate-pulse`} />
                        )}
                    </div>
                    <div className="text-center">
                        <h4 className={`text-[10px] font-bold uppercase tracking-wide ${config.textClass}`}>
                            {config.description}
                        </h4>
                        <p className={`text-[8px] mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {data.label}
                        </p>
                    </div>
                </div>
            </div>

            {/* Gate Status */}
            <div className={`p-1.5 ${isDark ? 'bg-black/30' : 'bg-gray-50'} flex items-center justify-center gap-1`}>
                <div className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <span className={`text-[8px] font-bold ${isActive ? 'text-emerald-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
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

    // Gate Management State - Pre-add all gates, disabled by default
    const [gates, setGates] = useState<Gate[]>([
        {
            id: 'gate-metadata-translation',
            type: 'approval',
            label: 'Translation Approval',
            sourceId: 'metadata',
            targetId: 'translation',
            config: {
                message: 'Approve translation before processing',
                enabled: false
            }
        },
        {
            id: 'gate-metadata-assets',
            type: 'notification',
            label: 'Asset Generation Alert',
            sourceId: 'metadata',
            targetId: 'assets',
            config: {
                message: 'Notify when asset generation starts',
                enabled: false
            }
        },
        {
            id: 'gate-translation-dubbing',
            type: 'approval',
            label: 'Dubbing Approval',
            sourceId: 'translation',
            targetId: 'dubbing',
            config: {
                message: 'Approve before starting dubbing',
                enabled: false
            }
        },
        {
            id: 'gate-assets-dubbing',
            type: 'conditional',
            label: 'Asset Check',
            sourceId: 'assets',
            targetId: 'dubbing',
            config: {
                message: 'Verify assets before dubbing',
                enabled: false
            }
        },
        {
            id: 'gate-dubbing-distribution',
            type: 'deploy',
            label: 'Production Deploy',
            sourceId: 'dubbing',
            targetId: 'distribution',
            config: {
                message: 'Approve deployment to production',
                enabled: true  // This one starts enabled
            }
        }
    ]);
    const [selectedGate, setSelectedGate] = useState<string | null>(null);
    const [showGatePanel, setShowGatePanel] = useState(false);
    const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
    const [isGatesPanelCollapsed, setIsGatesPanelCollapsed] = useState(false);

    // Gate Management - Only toggle needed since gates are pre-populated
    const toggleGate = useCallback((gateId: string) => {
        setGates(prev => prev.map(gate =>
            gate.id === gateId
                ? { ...gate, config: { ...gate.config, enabled: !gate.config.enabled } }
                : gate
        ));
    }, []);

    const nodeTypes = useMemo(() => ({
        workflowStage: WorkflowStageNode,
        gate: GateNode,
    }), []);

    // Get all possible edge connections
    const availableEdges = useMemo(() => [
        { id: 'e-metadata-translation', source: 'metadata', target: 'translation', label: 'Metadata → Translation' },
        { id: 'e-metadata-assets', source: 'metadata', target: 'assets', label: 'Metadata → Assets' },
        { id: 'e-translation-dubbing', source: 'translation', target: 'dubbing', label: 'Translation → Dubbing' },
        { id: 'e-assets-dubbing', source: 'assets', target: 'dubbing', label: 'Assets → Dubbing' },
        { id: 'e-dubbing-distribution', source: 'dubbing', target: 'distribution', label: 'Dubbing → Publishing' },
    ], []);

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
                position: { x: 100, y: 200 },
                data: {
                    icon: FileText,
                    label: 'Source Video',
                    category: 'INPUT',
                    imageUrl: videoThumbnail,
                    status: workflowState.metadata_extraction?.status || 'pending',
                    onPreview: () => onPreview?.(),
                },
                draggable: true,
            },
            {
                id: 'translation',
                type: 'workflowStage',
                position: { x: 600, y: 40 },
                data: {
                    icon: Globe,
                    label: 'Translation',
                    category: 'PROCESS',
                    imageUrl: '/workflow-translation.png',
                    status: translationStatus,
                    showActions: translationStatus === 'review',
                    onApprove: () => onApprove?.('all'),
                    onReject: () => onReject?.('all'),
                    onPreview: () => onPreview?.(),
                },
                draggable: true,
            },
            {
                id: 'assets',
                type: 'workflowStage',
                position: { x: 600, y: 360 },
                data: {
                    icon: ImageIcon,
                    label: 'Assets',
                    category: 'ASSET',
                    imageUrl: '/workflow-assets.png',
                    status: assetsStatus,
                    onPreview: () => onPreview?.(),
                },
                draggable: true,
            },
            {
                id: 'dubbing',
                type: 'workflowStage',
                position: { x: 1100, y: 200 },
                data: {
                    icon: Video,
                    label: 'Dubbing',
                    category: 'ENGINE',
                    imageUrl: '/workflow-dubbing.png',
                    status: dubbingStatus,
                    onPreview: () => onPreview?.(),
                },
                draggable: true,
            },
            {
                id: 'distribution',
                type: 'workflowStage',
                position: { x: 1600, y: 200 },
                data: {
                    icon: Sparkles,
                    label: 'Publishing',
                    category: 'OUTPUT',
                    imageUrl: videoThumbnail,
                    status: jobStatus === 'completed' ? 'completed' : 'pending',
                    onPreview: () => onPreview?.(),
                },
                draggable: true,
            },
        ];

        // Add gate nodes positioned inline on edges
        gates.forEach(gate => {
            // Find source and target node positions
            const sourceNode = flowNodes.find(n => n.id === gate.sourceId);
            const targetNode = flowNodes.find(n => n.id === gate.targetId);

            if (sourceNode && targetNode) {
                // Node widths: WorkflowStage = 180px, Gate = 140px
                const nodeWidth = 180;
                const gateWidth = 140;

                // Calculate position at the midpoint between the edges of the nodes
                const sourceRightEdge = sourceNode.position.x + nodeWidth;
                const targetLeftEdge = targetNode.position.x;
                const midpoint = (sourceRightEdge + targetLeftEdge) / 2;

                // Center gates precisely on the connection path
                const nodeHeight = 160; // Approximate height of stage node
                const gateHeight = 130; // Approximate height of gate node
                
                // Vertical midpoint of the nodes' centers
                const sourceCenterY = sourceNode.position.y + (nodeHeight / 2);
                const targetCenterY = targetNode.position.y + (nodeHeight / 2);
                const verticalCenter = (sourceCenterY + targetCenterY) / 2;

                const gatePosition = {
                    x: midpoint - (gateWidth / 2),
                    y: verticalCenter - (gateHeight / 2),
                };

                flowNodes.push({
                    id: gate.id,
                    type: 'gate' as const,
                    position: gatePosition,
                    data: {
                        gateType: gate.type,
                        label: gate.label,
                        config: gate.config,
                        onToggle: () => toggleGate(gate.id)
                    },
                    draggable: false,
                });
            }
        });

        const flowEdges: Edge[] = [];

        // Helper to check if a gate exists on an edge
        const getGateOnEdge = (source: string, target: string) =>
            gates.find(g => g.sourceId === source && g.targetId === target);

        // Build edges, inserting gates when they exist
        const addEdge = (source: string, target: string, edgeId: string, animated = false) => {
            const gate = getGateOnEdge(source, target);

            if (gate && gate.config.enabled) {
                // Split edge: source -> gate -> target
                flowEdges.push(
                    {
                        id: `${edgeId}-to-gate`,
                        source,
                        target: gate.id,
                        type: 'smoothstep',
                        animated,
                        style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                    },
                    {
                        id: `${edgeId}-from-gate`,
                        source: gate.id,
                        target,
                        type: 'smoothstep',
                        animated,
                        style: { stroke: '#a855f7', strokeWidth: 2, opacity: 0.8 }, // Purple for post-gate
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
                    }
                );
            } else {
                // Direct edge
                flowEdges.push({
                    id: edgeId,
                    source,
                    target,
                    type: 'smoothstep',
                    animated,
                    style: { stroke: '#3b82f6', strokeWidth: 2, opacity: 0.6 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                });
            }
        };

        addEdge('metadata', 'translation', 'e-metadata-translation', translationStatus === 'processing');
        addEdge('metadata', 'assets', 'e-metadata-assets', assetsStatus === 'processing');
        addEdge('translation', 'dubbing', 'e-translation-dubbing', dubbingStatus === 'processing' && translationStatus === 'completed');
        addEdge('assets', 'dubbing', 'e-assets-dubbing', dubbingStatus === 'processing' && assetsStatus === 'completed');
        addEdge('dubbing', 'distribution', 'e-dubbing-distribution', jobStatus === 'processing' && dubbingStatus === 'completed');

        return { nodes: flowNodes, edges: flowEdges };
    }, [workflowState, translationStatus, assetsStatus, dubbingStatus, jobStatus, onApprove, onReject, videoThumbnail, gates]);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`relative w-full max-w-7xl h-[75vh] ${cardClass} border ${borderClass} rounded-2xl shadow-2xl overflow-hidden flex flex-col scale-100 opacity-100 transition-all duration-300 animate-in fade-in zoom-in-95`}>
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
                    {/* Gate Status Panel - Collapsible */}
                    <div className={`absolute top-4 left-4 z-10 ${cardClass} border ${borderClass} rounded-xl shadow-lg transition-all duration-300 ${isGatesPanelCollapsed ? 'w-12' : 'w-72'}`}>
                        {/* Collapse/Expand Button */}
                        <button
                            onClick={() => setIsGatesPanelCollapsed(!isGatesPanelCollapsed)}
                            className={`absolute -right-3 top-3 z-20 p-1.5 ${cardClass} border ${borderClass} rounded-full shadow-md hover:scale-110 transition-transform ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            title={isGatesPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
                        >
                            {isGatesPanelCollapsed ? (
                                <ChevronRight className={`w-4 h-4 ${textClass}`} />
                            ) : (
                                <ChevronLeft className={`w-4 h-4 ${textClass}`} />
                            )}
                        </button>

                        {isGatesPanelCollapsed ? (
                            /* Collapsed State - Icon Only */
                            <div className="p-3">
                                <div className="flex flex-col items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-purple-500" />
                                    <div className="w-px h-8 bg-gradient-to-b from-purple-500/50 to-transparent" />
                                    <div className="flex flex-col gap-2 items-center">
                                        <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}>
                                            <span className={`text-[10px] font-bold ${textClass}`}>{gates.length}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center`}>
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                {gates.filter(g => g.config.enabled).length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Expanded State - Full Panel */
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className={`text-sm font-bold ${textClass} flex items-center gap-2`}>
                                        <ShieldCheck className="w-4 h-4 text-purple-500" />
                                        Workflow Gates
                                    </h4>
                                </div>

                                {/* Instructions */}
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border mb-3`}>
                                    <p className={`text-[10px] ${isDark ? 'text-blue-300' : 'text-blue-700'} leading-relaxed`}>
                                        Click the toggle button on any gate in the workflow to enable or disable it.
                                    </p>
                                </div>

                                {/* Gate List */}
                                <div className="space-y-2">
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${textSecondaryClass} mb-2`}>
                                        All Gates
                                    </p>

                                    {gates.map(gate => {
                                        const gateConfig = (() => {
                                            switch (gate.type) {
                                                case 'deploy': return { icon: ShieldCheck, color: 'text-purple-500', bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50' };
                                                case 'notification': return { icon: Bell, color: 'text-cyan-500', bg: isDark ? 'bg-cyan-500/10' : 'bg-cyan-50' };
                                                case 'approval': return { icon: Lock, color: 'text-amber-500', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' };
                                                case 'conditional': return { icon: GitBranch, color: 'text-pink-500', bg: isDark ? 'bg-pink-500/10' : 'bg-pink-50' };
                                            }
                                        })();
                                        const GateIcon = gateConfig.icon;

                                        return (
                                            <div
                                                key={gate.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'} ${!gate.config.enabled ? 'opacity-50' : ''}`}
                                            >
                                                <div className={`p-1.5 rounded ${gateConfig.bg}`}>
                                                    <GateIcon className={`w-3 h-3 ${gateConfig.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-[10px] font-medium ${textClass} truncate`}>{gate.label}</p>
                                                    <p className={`text-[8px] ${textSecondaryClass}`}>
                                                        {availableEdges.find(e => e.source === gate.sourceId && e.target === gate.targetId)?.label}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${gate.config.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Stats */}
                                <div className={`mt-3 pt-3 border-t ${borderClass}`}>
                                    <div className="grid grid-cols-2 gap-2 text-center">
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                                            <p className={`text-[10px] ${textSecondaryClass}`}>Total</p>
                                            <p className={`text-lg font-bold ${textClass}`}>{gates.length}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                            <p className={`text-[10px] text-emerald-600 dark:text-emerald-400`}>Active</p>
                                            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                {gates.filter(g => g.config.enabled).length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ReactFlow Canvas */}
                    <div className="absolute inset-0">
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            nodeTypes={nodeTypes}
                            fitView
                            fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                            attributionPosition="bottom-left"
                            proOptions={{ hideAttribution: true }}
                            nodesDraggable={true}
                            nodesConnectable={false}
                            elementsSelectable={true}
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
        </div>,
        document.body
    );
}
