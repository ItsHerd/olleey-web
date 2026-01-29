"use client";

import { useCallback } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component for workflow nodes
const WorkflowNode = ({ data }: any) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] w-[240px] transition-all hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)] group">
            <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-2.5 !h-2.5 !border-none !-translate-x-1" />
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2.5 !h-2.5 !border-none !translate-x-1" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="p-1 px-3 bg-olleey-yellow/10 text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-olleey-yellow/20">{data.category || 'Workflow'}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-1 tracking-tight">{data.label}</h4>
                {data.oneLiner && (
                    <p className="text-[10px] text-zinc-400 mb-4 font-medium leading-relaxed italic border-l-2 border-olleey-yellow/30 pl-3">
                        {data.oneLiner}
                    </p>
                )}

                {data.image && (
                    <div className="aspect-video relative bg-gray-50 rounded-2xl overflow-hidden mb-4 border border-zinc-100 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                        {data.videoUrl ? (
                            <video
                                src={data.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : data.imageUrl ? (
                            <img
                                src={data.imageUrl}
                                alt={data.label}
                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                                <span className="text-3xl">{data.emoji}</span>
                            </div>
                        )}
                    </div>
                )}

                {data.content && (
                    <p className="text-[11px] text-zinc-500 leading-tight mb-2 font-medium">
                        {data.content}
                    </p>
                )}
            </div>

            <div className="bg-zinc-50/50 p-4 flex justify-between items-center border-t border-zinc-100 group-hover:bg-zinc-50 transition-colors">
                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{data.actionLabel || 'Status'}</span>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{data.status || 'Ready'}</span>
                    {data.hasRun && (
                        <button className="px-4 py-1.5 bg-black text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-olleey-yellow hover:text-black transition-all shadow-md active:scale-95">
                            EXECUTE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const nodeTypes = {
    workflow: WorkflowNode,
};

const initialNodes: Node[] = [
    {
        id: 'source-input',
        type: 'workflow',
        position: { x: 0, y: 250 },
        data: {
            label: '24/7 Channel Watch',
            category: 'INGESTION',
            oneLiner: 'Zero-latency source monitoring...',
            content: 'Proprietary crawlers monitor YouTube, RSS, and storage buckets for new masters.',
            imageUrl: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1548&auto=format&fit=crop',
            image: true,
            status: 'Monitoring',
            actionLabel: 'SOURCE',
        },
    },
    {
        id: 'clone-audio',
        type: 'workflow',
        position: { x: 350, y: 50 },
        data: {
            label: 'Identity Preservation',
            category: 'NEURAL CLONE',
            oneLiner: 'High-fidelity vocal extraction...',
            content: 'Isolating vocal timbre and prosody to maintain 1:1 identity across languages.',
            imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Identified',
            hasRun: true,
            actionLabel: 'CLONE',
        },
    },
    {
        id: 'translate',
        type: 'workflow',
        position: { x: 350, y: 450 },
        data: {
            label: 'Semantic Mapping',
            category: 'DUB ENGINE',
            oneLiner: 'Deep context translation...',
            content: 'Moving beyond literal translation to preserve emotional intent and technical accuracy.',
            imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Ready',
            actionLabel: 'MAP',
        },
    },
    {
        id: 'context-rewrite',
        type: 'workflow',
        position: { x: 700, y: 250 },
        data: {
            label: 'Cultural Adaptation',
            category: 'LLM TUNING',
            oneLiner: 'Retention-first optimization...',
            content: 'LLMs optimize script length for lip-sync and adapt slang for local audience retention.',
            imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Optimized',
            actionLabel: 'ADAPT',
        },
    },
    {
        id: 'lip-sync',
        type: 'workflow',
        position: { x: 1050, y: 250 },
        data: {
            label: 'Generative Lip-Sync',
            category: 'SYNTHESIS',
            oneLiner: '60fps frame-accurate render...',
            content: 'High-fidelity visual synthesis matching the neural voice with zero-artifact output.',
            imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop',
            image: true,
            videoUrl: '/speaker.mp4',
            status: 'Rendering',
            hasRun: true,
            actionLabel: 'SYNTH',
        },
    },
    {
        id: 'qc-gate',
        type: 'workflow',
        position: { x: 1400, y: 250 },
        data: {
            label: 'Enterprise Governance',
            category: 'QUALITY GATE',
            oneLiner: 'AI + Human verification layer...',
            content: 'Automated confidence checks. Low-score segments trigger 24/7 human review.',
            imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Verified',
            actionLabel: 'AUDIT',
        },
    },
    {
        id: 'brand-swap',
        type: 'workflow',
        position: { x: 1750, y: 100 },
        data: {
            label: 'Regional Monetization',
            category: 'AD-LOCALIZATION',
            oneLiner: 'Dynamic sponsor injection...',
            content: 'Swapping sponsors and in-video assets based on regional monetization policy.',
            imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Ready',
            actionLabel: 'SWAP',
        },
    },
    {
        id: 'global-dist',
        type: 'workflow',
        position: { x: 1750, y: 480 },
        data: {
            label: 'Automated Publishing',
            category: 'API OUTPUT',
            oneLiner: 'Direct platform distribution...',
            content: 'Pushing localized masters directly to YouTube Regional Hubs, Instagram, and TikTok.',
            imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=400&auto=format&fit=crop',
            image: true,
            status: 'Broadcast',
            hasRun: true,
            actionLabel: 'DEPLOY',
        },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e-src-clone',
        source: 'source-input',
        target: 'clone-audio',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-src-trans',
        source: 'source-input',
        target: 'translate',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-clone-context',
        source: 'clone-audio',
        target: 'context-rewrite',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-trans-context',
        source: 'translate',
        target: 'context-rewrite',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-context-sync',
        source: 'context-rewrite',
        target: 'lip-sync',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-sync-qc',
        source: 'lip-sync',
        target: 'qc-gate',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-qc-brand',
        source: 'qc-gate',
        target: 'brand-swap',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
    {
        id: 'e-qc-dist',
        source: 'qc-gate',
        target: 'global-dist',
        type: 'straight',
        style: { stroke: '#D4D4D8', strokeWidth: 2, opacity: 0.4 },
    },
];

export function FlowchartAnimation({ onGetStarted }: { onGetStarted?: () => void }) {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div id="workflows" className="relative w-full min-h-[900px] bg-white py-24 px-8 overflow-hidden">
            {/* Subtitle Background Accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 text-center mb-24 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full border border-black/5 mb-8">
                    <span className="w-2 h-2 rounded-full bg-rolleey-yellow animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black">The Engine</span>
                </div>
                <h2 className="text-[40px] md:text-[64px] leading-[1.1] font-normal tracking-tighter text-black mb-8 px-4">
                    Architect Your <span className="font-semibold italic">Global</span> Release.
                </h2>
                <p className="text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed mb-10">
                    Our zero-latency pipeline handles everything from neural voice cloning to regional ad-injection, ensuring you feel native in every language.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="px-8 py-3 bg-black text-white rounded-full text-sm font-bold tracking-tight hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                    >
                        Start Your First Pipeline
                    </button>
                    <button className="px-8 py-3 border border-zinc-200 rounded-full text-sm font-bold tracking-tight hover:bg-zinc-50 transition-all">
                        Watch the Demo
                    </button>
                </div>
            </div>

            {/* React Flow Diagram */}
            <div className="relative max-w-7xl mx-auto h-[750px] bg-white border border-zinc-100 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="absolute top-8 left-8 z-20 flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400/20 border border-red-400/40" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400/20 border border-yellow-400/40" />
                        <div className="w-2 h-2 rounded-full bg-green-400/20 border border-green-400/40" />
                    </div>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={{
                        type: 'straight',
                        style: {
                            stroke: '#D4D4D8',
                            strokeWidth: 2,
                            opacity: 0.4,
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#D4D4D8',
                            width: 15,
                            height: 15,
                        },
                    }}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    attributionPosition="bottom-left"
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={true}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    panOnScroll={false}
                    panOnDrag={true}
                    preventScrolling={false}
                >
                    <Background color="#F4F4F5" gap={40} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}
