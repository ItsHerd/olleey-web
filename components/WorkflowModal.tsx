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
    ChevronRight,
    Cpu,
    Zap,
    Activity,
    Server,
    Database,
    Radio
} from 'lucide-react';
import { JobWorkflowState } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { getLanguageFlag } from '@/lib/languages';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Gate Types
export type GateType = 'deploy' | 'notification' | 'approval' | 'conditional';

export interface Gate {
    id: string;
    type: GateType;
    label: string;
    sourceId: string;
    targetId: string;
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

// ------------------------------------------------------------------
// CUSTOM NODES
// ------------------------------------------------------------------

const WorkflowStageNode = ({ data }: any) => {
    const isDark = true; // Force dark mode for premium look

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'completed':
                return {
                    border: 'border-emerald-500/50',
                    bg: 'bg-emerald-500/[0.03]',
                    glow: 'shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]',
                    text: 'text-emerald-500',
                    iconBg: 'bg-emerald-500/20 text-emerald-400',
                    statusLabel: 'OPTIMIZED'
                };
            case 'processing':
                return {
                    border: 'border-olleey-yellow/60',
                    bg: 'bg-olleey-yellow/[0.03]',
                    glow: 'shadow-[0_0_40px_-5px_rgba(251,191,36,0.2)]',
                    text: 'text-olleey-yellow',
                    iconBg: 'bg-olleey-yellow/20 text-olleey-yellow',
                    statusLabel: 'PROCESSING',
                    animate: true
                };
            case 'failed':
                return {
                    border: 'border-red-500/60',
                    bg: 'bg-red-500/[0.05]',
                    glow: 'shadow-[0_0_30px_-5px_rgba(239,68,68,0.4)]',
                    text: 'text-red-500',
                    iconBg: 'bg-red-500/20 text-red-500',
                    statusLabel: 'CRITICAL ERROR'
                };
            case 'review':
                return {
                    border: 'border-blue-500/60',
                    bg: 'bg-blue-500/[0.05]',
                    glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]',
                    text: 'text-blue-400',
                    iconBg: 'bg-blue-500/20 text-blue-400',
                    statusLabel: 'AWAITING INPUT'
                };
            default:
                return {
                    border: 'border-white/10',
                    bg: 'bg-white/[0.02]',
                    glow: '',
                    text: 'text-white/40',
                    iconBg: 'bg-white/5 text-white/40',
                    statusLabel: 'IDLE'
                };
        }
    };

    const config = getStatusConfig(data.status);
    const Icon = data.icon;

    return (
        <div className={cn(
            "relative w-[280px] rounded-[1.5rem] border backdrop-blur-xl transition-all duration-500 group overflow-hidden",
            "bg-[#0a0a0a]", // Base background
            config.border,
            config.bg,
            config.glow
        )}>
            {/* Tech Decoration Lines */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />

            {config.animate && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]" />
            )}

            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[#1a1c20] !border-2 !border-white/20 !-translate-x-1.5" />

            <div className="p-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 shadow-inner", config.iconBg)}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 block mb-0.5">{data.category}</span>
                            <h3 className="text-sm font-bold text-white tracking-wide">{data.label}</h3>
                        </div>
                    </div>
                    {data.status === 'processing' && (
                        <Activity className="w-4 h-4 text-olleey-yellow animate-pulse" />
                    )}
                </div>

                {/* Content Area */}
                <div className="space-y-3">
                    {data.imageUrl && (
                        <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-white/5 group-hover:border-white/20 transition-colors">
                            <img src={data.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[8px] font-mono text-white/60 border border-white/10">
                                IMG_ASSET_001
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", data.status === 'processing' ? "bg-olleey-yellow animate-pulse" : config.text.replace('text-', 'bg-'))} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", config.text)}>
                                {config.statusLabel}
                            </span>
                        </div>

                        {data.status !== 'pending' && data.status !== 'processing' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); data.onPreview?.(); }}
                                className="text-[9px] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider"
                            >
                                <Eye className="w-3 h-3" /> Inspect
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons Overlay */}
            {data.showActions && (
                <div className="absolute inset-x-0 bottom-0 p-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex gap-2 animate-in slide-in-from-bottom-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); data.onApprove?.(); }}
                        className="flex-1 h-8 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); data.onReject?.(); }}
                        className="flex-1 h-8 rounded bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/30 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                        <X className="w-3 h-3" /> Reject
                    </button>
                </div>
            )}

            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[#1a1c20] !border-2 !border-white/20 !translate-x-1.5" />
        </div>
    );
};

const GateNode = ({ data }: any) => {
    const isActive = data.config?.enabled;

    const getGateStyle = (type: GateType) => {
        switch (type) {
            case 'deploy': return { color: 'text-purple-400', border: 'border-purple-500/40', glow: 'shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]', bg: 'bg-purple-500/10' };
            case 'notification': return { color: 'text-cyan-400', border: 'border-cyan-500/40', glow: 'shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]', bg: 'bg-cyan-500/10' };
            case 'approval': return { color: 'text-amber-400', border: 'border-amber-500/40', glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]', bg: 'bg-amber-500/10' };
            case 'conditional': return { color: 'text-pink-400', border: 'border-pink-500/40', glow: 'shadow-[0_0_15px_-3px_rgba(236,72,153,0.3)]', bg: 'bg-pink-500/10' };
            default: return { color: 'text-white/40', border: 'border-white/10', glow: 'shadow-none', bg: 'bg-white/5' };
        }
    };

    const style = getGateStyle(data.gateType);
    const Icon = {
        deploy: ShieldCheck,
        notification: Bell,
        approval: Lock,
        conditional: GitBranch
    }[data.gateType as GateType] || ShieldCheck;

    return (
        <div className={cn(
            "w-[140px] rounded-xl border-2 backdrop-blur-md transition-all duration-300 group relative overflow-hidden",
            "bg-[#0a0a0a]",
            isActive ? style.border : "border-white/5",
            isActive ? style.glow : "grayscale opacity-60"
        )}>
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white/20 !border-none" />

            {/* Tech Header */}
            <div className="h-1 w-full flex">
                <div className={cn("flex-1 h-full transition-colors", isActive ? "bg-current opacity-50" : "bg-white/5", style.color)} />
                <div className="flex-[2] h-full bg-black/40" />
                <div className={cn("flex-1 h-full transition-colors", isActive ? "bg-current opacity-50" : "bg-white/5", style.color)} />
            </div>

            <div className="p-3 text-center relative z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); data.onToggle(); }}
                    className={cn(
                        "absolute top-2 right-2 p-1 rounded-full transition-all hover:bg-white/10",
                        isActive ? style.color : "text-white/20"
                    )}
                >
                    {isActive ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                </button>

                <div className={cn("w-8 h-8 mx-auto rounded-lg flex items-center justify-center mb-2 transition-colors", isActive ? style.bg : "bg-white/5")}>
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? style.color : "text-white/20")} />
                </div>

                <h4 className={cn("text-[9px] font-black uppercase tracking-wider mb-0.5", isActive ? "text-white" : "text-white/30")}>
                    {data.gateType} Check
                </h4>
                <p className="text-[8px] text-white/30 font-mono truncate px-1">{data.label}</p>
            </div>

            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-current to-transparent opacity-[0.03] pointer-events-none" style={{ color: style.color }} />
            )}

            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white/20 !border-none" />
        </div>
    );
}


// ------------------------------------------------------------------
// MAIN MODAL
// ------------------------------------------------------------------

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

    // Gate State
    const [gates, setGates] = useState<Gate[]>([
        { id: 'gate-1', type: 'approval', label: 'QC Check', sourceId: 'metadata', targetId: 'translation', config: { enabled: false } },
        { id: 'gate-2', type: 'notification', label: 'Completion Alert', sourceId: 'metadata', targetId: 'assets', config: { enabled: false } },
        { id: 'gate-3', type: 'approval', label: 'Lip-Sync Validate', sourceId: 'translation', targetId: 'dubbing', config: { enabled: false } },
        { id: 'gate-4', type: 'conditional', label: 'Asset Check', sourceId: 'assets', targetId: 'dubbing', config: { enabled: false } },
        { id: 'gate-5', type: 'deploy', label: 'Release Gate', sourceId: 'dubbing', targetId: 'distribution', config: { enabled: true } }
    ]);
    const [isGatesPanelCollapsed, setIsGatesPanelCollapsed] = useState(false);

    const toggleGate = useCallback((gateId: string) => {
        setGates(prev => prev.map(gate =>
            gate.id === gateId ? { ...gate, config: { ...gate.config, enabled: !gate.config.enabled } } : gate
        ));
    }, []);

    const nodeTypes = useMemo(() => ({
        workflowStage: WorkflowStageNode,
        gate: GateNode,
    }), []);

    // Helper status calculators
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
        if (dubbing.some((t: any) => ['processing', 'voice_cloning', 'lip_sync'].includes(t.status))) return 'processing';
        if (dubbing.length > 0 && dubbing.every((t: any) => t.status === 'completed')) return 'completed';
        if (dubbing.some((t: any) => t.status === 'failed')) return 'failed';
        return 'pending';
    }, [workflowState.video_dubbing]);

    const { nodes, edges } = useMemo(() => {
        // Base Nodes
        const flowNodes: Node[] = [
            { id: 'metadata', type: 'workflowStage', position: { x: 0, y: 200 }, data: { icon: FileText, label: 'Source Ingestion', category: 'INPUT', imageUrl: videoThumbnail, status: workflowState.metadata_extraction?.status || 'pending', onPreview: () => onPreview?.() } },
            { id: 'translation', type: 'workflowStage', position: { x: 500, y: 0 }, data: { icon: Globe, label: 'Neural Translation', category: 'PROCESS', status: translationStatus, showActions: translationStatus === 'review', onApprove: () => onApprove?.('all'), onReject: () => onReject?.('all'), onPreview: () => onPreview?.() } },
            { id: 'assets', type: 'workflowStage', position: { x: 500, y: 400 }, data: { icon: ImageIcon, label: 'Visual Assets', category: 'ASSET', status: assetsStatus, onPreview: () => onPreview?.() } },
            { id: 'dubbing', type: 'workflowStage', position: { x: 1000, y: 200 }, data: { icon: Video, label: 'Dubbing Engine', category: 'CORE', status: dubbingStatus, onPreview: () => onPreview?.() } },
            { id: 'distribution', type: 'workflowStage', position: { x: 1500, y: 200 }, data: { icon: Server, label: 'Global CDN', category: 'OUTPUT', status: jobStatus === 'completed' || jobStatus === 'live' ? 'completed' : 'pending', onPreview: () => onPreview?.() } },
        ];

        // Gates & Edges
        const flowEdges: Edge[] = [];
        const addSmartEdge = (source: string, target: string, edgeId: string, animated = false) => {
            const gate = gates.find(g => g.sourceId === source && g.targetId === target);
            if (gate && gate.config.enabled) {
                // Determine gate position
                const sourceNode = flowNodes.find(n => n.id === source);
                const targetNode = flowNodes.find(n => n.id === target);

                if (sourceNode && targetNode) {
                    const midpointX = (sourceNode.position.x + targetNode.position.x + 280) / 2 - 70; // 280 width, 70 half gate
                    const midpointY = (sourceNode.position.y + targetNode.position.y) / 2 + 50;

                    flowNodes.push({
                        id: gate.id,
                        type: 'gate',
                        position: { x: midpointX, y: midpointY },
                        data: { ...gate, onToggle: () => toggleGate(gate.id) },
                        draggable: false
                    });

                    flowEdges.push(
                        { id: `${edgeId}-pre`, source, target: gate.id, type: 'smoothstep', animated, style: { stroke: '#555', strokeWidth: 2 } },
                        { id: `${edgeId}-post`, source: gate.id, target, type: 'smoothstep', animated, style: { stroke: '#555', strokeWidth: 2 } }
                    );
                }
            } else {
                flowEdges.push({ id: edgeId, source, target, type: 'smoothstep', animated, style: { stroke: '#333', strokeWidth: 2 } });
            }
        };

        addSmartEdge('metadata', 'translation', 'e1', translationStatus === 'processing');
        addSmartEdge('metadata', 'assets', 'e2', assetsStatus === 'processing');
        addSmartEdge('translation', 'dubbing', 'e3', dubbingStatus === 'processing');
        addSmartEdge('assets', 'dubbing', 'e4', dubbingStatus === 'processing');
        addSmartEdge('dubbing', 'distribution', 'e5', jobStatus === 'processing');

        return { nodes: flowNodes, edges: flowEdges };
    }, [workflowState, gates, translationStatus, assetsStatus, dubbingStatus, jobStatus]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-[90vw] h-[85vh] bg-[#020202] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">

                {/* Header */}
                <div className="h-20 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-8 z-20 shrink-0">
                    <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-full bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20">
                            <GitBranch className="w-5 h-5 text-olleey-yellow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-normal text-white tracking-tight">Workflow Orchestrator</h2>
                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                                    ID: {jobId.slice(0, 8)}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-mono text-white/30 uppercase">Target: {targetLanguages.length} Regions</span>
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-[10px] font-mono text-white/30 uppercase">Latency: 12ms</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group border border-white/5">
                        <X className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </button>
                </div>

                {/* Main Canvas Area */}
                <div className="flex-1 relative bg-[#050505]">
                    {/* Background Grid Accent */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                    />

                    {/* Left Panel: Gates */}
                    <div className={cn(
                        "absolute top-6 left-6 z-10 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-xl overflow-hidden transition-all duration-500 flex flex-col",
                        isGatesPanelCollapsed ? "w-16 h-16" : "w-72 max-h-[600px]"
                    )}>
                        <div className="p-4 flex items-center justify-between border-b border-white/5 shrink-0 h-16">
                            {!isGatesPanelCollapsed && (
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-black uppercase tracking-widest text-white/80">Security Gates</span>
                                </div>
                            )}
                            <button
                                onClick={() => setIsGatesPanelCollapsed(!isGatesPanelCollapsed)}
                                className={cn("w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors", isGatesPanelCollapsed && "w-full h-full")}
                            >
                                {isGatesPanelCollapsed ? <Database className="w-4 h-4 text-white/40" /> : <ChevronLeft className="w-4 h-4 text-white/40" />}
                            </button>
                        </div>

                        {!isGatesPanelCollapsed && (
                            <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 mb-4">
                                    <p className="text-[10px] text-purple-300 leading-relaxed font-medium">
                                        Active gates intercept production flow for manual verification.
                                    </p>
                                </div>
                                {gates.map(gate => (
                                    <button
                                        key={gate.id}
                                        onClick={() => toggleGate(gate.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                                            gate.config.enabled ? "bg-white/5 border-white/10" : "bg-transparent border-transparent opacity-50 hover:bg-white/5 hover:opacity-80"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full shrink-0", gate.config.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white/20")} />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] font-black uppercase text-white tracking-wider block truncate">{gate.label}</span>
                                            <span className="text-[9px] text-white/30 truncate block">{gate.type} Protocol</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        proOptions={{ hideAttribution: true }}
                        minZoom={0.5}
                        maxZoom={1.5}
                        className="bg-transparent"
                    >
                        <Background color="#333" gap={40} size={1} variant={BackgroundVariant.Dots} />
                    </ReactFlow>
                </div>

                {/* Footer Controls */}
                <div className="h-20 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-between px-8 z-20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">System Nominal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={onRetry}
                            disabled={!onRetry}
                            className="h-10 rounded-full border-white/10 hover:bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest gap-2"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-Initialize
                        </Button>
                        <Button
                            onClick={onPreview}
                            disabled={!onPreview}
                            className="h-10 px-6 rounded-full bg-olleey-yellow hover:bg-olleey-yellow/90 text-black text-[10px] font-black uppercase tracking-widest gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" /> Live Analysis
                        </Button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}

