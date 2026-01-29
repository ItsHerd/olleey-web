"use client";

import { useCallback } from 'react';
import { motion } from 'framer-motion';
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
        <div className="bg-black/90 border border-white/20 rounded-sm overflow-hidden w-[240px] transition-all hover:border-white/60 group relative backdrop-blur-sm">
            {/* Technical corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />

            <Handle type="target" position={Position.Left} className="!bg-black !border !border-white !w-2 !h-2 !rounded-none" />
            <Handle type="source" position={Position.Right} className="!bg-black !border !border-white !w-2 !h-2 !rounded-none" />

            <div className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-white/70">{data.category || 'NODE'}</span>
                    <div className="w-1.5 h-1.5 bg-white/60 animate-pulse" />
                </div>

                <h4 className="text-xs font-bold font-mono text-white mb-2 uppercase tracking-wide">{data.label}</h4>
                {data.oneLiner && (
                    <p className="text-[9px] text-gray-400 mb-3 font-mono leading-relaxed pl-2 border-l border-white/20">
                        {data.oneLiner}
                    </p>
                )}

                {data.image && (
                    <div className="aspect-video relative bg-white/5 border border-white/10 mb-3 grayscale overflow-hidden">
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-scan" />
                        {data.videoUrl ? (
                            <video
                                src={data.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                            />
                        ) : data.imageUrl ? (
                            <img
                                src={data.imageUrl}
                                alt={data.label}
                                className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl text-white/20">{data.emoji}</span>
                            </div>
                        )}
                    </div>
                )}

                {data.content && (
                    <p className="text-[9px] text-gray-500 font-mono leading-tight">
                        {data.content}
                    </p>
                )}
            </div>

            <div className="bg-white/5 p-2 px-4 flex justify-between items-center border-t border-white/10">
                <span className="text-[8px] font-mono uppercase text-white/40 tracking-wider">STS:{data.actionLabel || 'RDY'}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-white/60 uppercase">{data.status || 'IDLE'}</span>
                    {data.hasRun && (
                        <div className="w-1 h-1 bg-white" />
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
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-src-trans',
        source: 'source-input',
        target: 'translate',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-clone-context',
        source: 'clone-audio',
        target: 'context-rewrite',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-trans-context',
        source: 'translate',
        target: 'context-rewrite',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-context-sync',
        source: 'context-rewrite',
        target: 'lip-sync',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-sync-qc',
        source: 'lip-sync',
        target: 'qc-gate',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-qc-brand',
        source: 'qc-gate',
        target: 'brand-swap',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
    {
        id: 'e-qc-dist',
        source: 'qc-gate',
        target: 'global-dist',
        type: 'step',
        style: { stroke: '#FFFFFF', strokeWidth: 1, opacity: 0.3 },
        animated: true,
    },
];

export function FlowchartAnimation({ onGetStarted }: { onGetStarted?: () => void }) {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div id="workflows" className="relative w-full min-h-[900px] bg-black py-24 px-8 overflow-hidden z-10 border-t border-white/20">
            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20" 
                style={{ 
                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} 
            />

            {/* Header */}
            <div className="relative z-10 text-center mb-20 max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-3 px-4 py-1 border border-white/30 backdrop-blur-sm mb-6"
                >
                    <span className="w-1.5 h-1.5 bg-white animate-pulse" />
                    <span className="text-[10px] font-mono tracking-[0.3em] text-white">THE ENGINE</span>
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl md:text-5xl font-bold font-mono text-white mb-6 uppercase tracking-wider"
                >
                    Architect Your <br/>
                    <span className="text-white/50">Global Release.</span>
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-sm md:text-base font-mono text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10 border-l-2 border-white/20 pl-4 text-left md:text-center md:border-l-0 md:pl-0"
                >
                    Our zero-latency pipeline handles everything from neural voice cloning to regional ad-injection, ensuring you feel native in every language.
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col md:flex-row justify-center gap-4"
                >
                    <button
                        onClick={onGetStarted}
                        className="group relative px-6 py-2.5 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-transparent hover:text-white hover:border-white border border-transparent transition-all"
                    >
                        Start Your First Pipeline
                        <div className="absolute inset-0 border border-white translate-x-1 translate-y-1 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
                    </button>
                    
                    <button className="px-6 py-2.5 border border-white/40 text-white font-mono text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        <span className="w-2 h-2 border border-white rounded-full flex items-center justify-center">
                            <span className="w-0.5 h-0.5 bg-white rounded-full" />
                        </span>
                        Watch the Demo
                    </button>
                </motion.div>
            </div>

            {/* React Flow Diagram Frame */}
            <div className="relative max-w-7xl mx-auto h-[700px] border border-white/20 bg-black/50 backdrop-blur-sm">
                {/* Technical Markers */}
                <div className="absolute top-0 left-0 p-2 border-b border-r border-white/20 font-mono text-[9px] text-white/50">
                    SYS.VIEW.01
                </div>
                <div className="absolute bottom-0 right-0 p-2 border-t border-l border-white/20 font-mono text-[9px] text-white/50">
                    COORD: 34.052, -118.243
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={{
                        type: 'step',
                        style: {
                            stroke: '#FFFFFF',
                            strokeWidth: 1,
                            opacity: 0.3,
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#FFFFFF',
                            width: 12,
                            height: 12,
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
                    <Background color="#333" gap={20} size={1} variant={"dots" as any} />
                </ReactFlow>
            </div>
        </div>
    );
}
