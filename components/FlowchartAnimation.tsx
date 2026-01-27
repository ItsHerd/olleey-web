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
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] w-[220px] transition-all hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.15)] group">
            <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-2 !h-2 !border-none !-translate-x-1" />
            <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2 !h-2 !border-none !translate-x-1" />

            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-widest">{data.category || 'Workflow'}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>

                <h4 className="text-sm font-bold text-gray-900 mb-1">{data.label}</h4>
                {data.oneLiner && (
                    <p className="text-[10px] text-gray-500 mb-3 font-medium leading-relaxed italic border-l-2 border-blue-100 pl-2">
                        {data.oneLiner}
                    </p>
                )}

                {data.image && (
                    <div className="aspect-video relative bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-100">
                        {data.videoUrl ? (
                            <video
                                src={data.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                <span className="text-3xl">{data.emoji}</span>
                            </div>
                        )}
                    </div>
                )}

                {data.content && (
                    <p className="text-[11px] text-gray-600 leading-tight mb-2">
                        {data.content}
                    </p>
                )}
            </div>

            <div className="bg-gray-50/50 p-3 flex justify-between items-center border-t border-gray-100 group-hover:bg-gray-50 transition-colors">
                <span className="text-[9px] font-bold uppercase text-gray-400 tracking-tighter">{data.actionLabel || 'Status'}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-blue-600 uppercase">{data.status || 'Ready'}</span>
                    {data.hasRun && (
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm">
                            Execute
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
        position: { x: 0, y: 150 },
        data: {
            label: 'Source Video (EN)',
            category: 'INPUT',
            oneLiner: 'Automatic ingestion from YouTube...',
            content: 'High-quality 4K master file uploaded to Olleey cloud.',
            emoji: '📺',
            image: true,
            status: 'Synced',
            actionLabel: 'SOURCE',
        },
    },
    {
        id: 'clone-audio',
        type: 'workflow',
        position: { x: 300, y: 0 },
        data: {
            label: 'Neural Voice Clone',
            category: 'ENGINE',
            oneLiner: 'Instant 1:1 vocal replication...',
            content: 'Capturing pitch, frequency and emotive nuances.',
            emoji: '🎙️',
            image: true,
            status: 'Active',
            hasRun: true,
            actionLabel: 'ANALYZE',
        },
    },
    {
        id: 'translate',
        type: 'workflow',
        position: { x: 300, y: 300 },
        data: {
            label: 'AI Translation',
            category: 'PROCESS',
            oneLiner: 'Context-aware native rewrite...',
            content: 'Localizing nuance and slang for native feel.',
            emoji: '🌍',
            image: true,
            status: '24/40',
            actionLabel: 'SYNC',
        },
    },
    {
        id: 'lip-sync',
        type: 'workflow',
        position: { x: 600, y: 150 },
        data: {
            label: 'Visual Lip-Sync',
            category: 'RENDER',
            oneLiner: 'Zero-artifact mouth regeneration...',
            content: 'Regenerating mouth movements with zero artifacts.',
            emoji: '🎬',
            image: true,
            videoUrl: '/speaker.mp4',
            status: 'In Progress',
            hasRun: true,
            actionLabel: 'INGEST',
        },
    },
    {
        id: 'brand-swap',
        type: 'workflow',
        position: { x: 900, y: 50 },
        data: {
            label: 'Dynamic Sponsor',
            category: 'LOCALIZE',
            oneLiner: 'Regional ad injection...',
            content: 'Injecting regional sponsors into video segments.',
            emoji: '🏷️',
            image: true,
            status: 'Ready',
            actionLabel: 'SWAP',
        },
    },
    {
        id: 'global-dist',
        type: 'workflow',
        position: { x: 900, y: 250 },
        data: {
            label: 'Global Release',
            category: 'OUTPUT',
            oneLiner: 'Multichannel worldwide blast...',
            content: 'Pushing localized masters to satellite hubs.',
            emoji: '🚀',
            image: true,
            status: 'Queue',
            hasRun: true,
            actionLabel: 'PUSH',
        },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e-src-clone',
        source: 'source-input',
        target: 'clone-audio',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
    {
        id: 'e-src-trans',
        source: 'source-input',
        target: 'translate',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
    {
        id: 'e-clone-sync',
        source: 'clone-audio',
        target: 'lip-sync',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
    {
        id: 'e-trans-sync',
        source: 'translate',
        target: 'lip-sync',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
    {
        id: 'e-sync-brand',
        source: 'lip-sync',
        target: 'brand-swap',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
    {
        id: 'e-sync-dist',
        source: 'lip-sync',
        target: 'global-dist',
        type: 'straight',
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
    },
];

export function FlowchartAnimation() {
    const [nodes, , onNodesChange] = useNodesState(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="relative w-full min-h-[600px] bg-white py-16 px-8">
            {/* Header */}
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-normal text-black mb-4">
                    Build the Workflows.<br />Turn every upload into a worldwide release.
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                    Automated video regeneration and distribution that makes you feel native in every language.
                </p>
                <button className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors">
                    Learn more about Workflows
                </button>
            </div>

            {/* React Flow Diagram */}
            <div className="relative max-w-6xl mx-auto h-[500px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={{
                        type: 'straight',
                        style: {
                            stroke: '#3b82f6',
                            strokeWidth: 1.5,
                            opacity: 0.5,
                        },
                    }}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    attributionPosition="bottom-left"
                    proOptions={{ hideAttribution: true }}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    elementsSelectable={false}
                    zoomOnScroll={false}
                    zoomOnPinch={false}
                    zoomOnDoubleClick={false}
                    panOnScroll={false}
                    panOnDrag={false}
                    preventScrolling={false}
                >
                    <Background color="#f1f5f9" gap={20} />
                </ReactFlow>
            </div>
        </div>
    );
}
