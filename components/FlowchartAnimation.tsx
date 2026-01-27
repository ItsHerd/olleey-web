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
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg w-[180px]">
            <Handle type="target" position={Position.Left} style={{ background: '#6b7280' }} />
            <Handle type="source" position={Position.Right} style={{ background: '#6b7280' }} />

            <div className="bg-black text-white p-2 flex justify-between items-center">
                <span className="text-xs font-semibold">{data.label}</span>
                {data.hasMenu && <button className="text-white">⋯</button>}
            </div>
            {data.content && (
                <div className="p-3 text-xs text-white/80">
                    {data.content}
                </div>
            )}
            {data.image && (
                <div className="aspect-square bg-gray-800 flex items-center justify-center overflow-hidden">
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
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
                            <span className="text-4xl">{data.emoji}</span>
                        </div>
                    )}
                </div>
            )}
            {data.footer && (
                <div className="bg-black text-white text-[10px] p-2 flex justify-between items-center">
                    <span>{data.footer}</span>
                    {data.hasRun && (
                        <button className="px-2 py-0.5 bg-white text-black rounded text-[10px] font-semibold">
                            Run
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    workflow: WorkflowNode,
};

const initialNodes: Node[] = [
    {
        id: 'text-input-1',
        type: 'workflow',
        position: { x: 0, y: 0 },
        data: {
            label: 'Video Description',
            content: 'The flower arrangement is in the middle of the street at night in New York City, on 5 to 8 by street lamps.',
        },
    },
    {
        id: 'image-input',
        type: 'workflow',
        position: { x: 0, y: 250 },
        data: {
            label: 'PewDiePie Channel',
            image: true,
            videoUrl: '/speaker.mp4',
            footer: 'English 🇺🇲',
        },
    },
    {
        id: 'gen3-image',
        type: 'workflow',
        position: { x: 350, y: 250 },
        data: {
            label: 'PewDiePie Spain',
            hasMenu: true,
            image: true,
            videoUrl: '/speaker.mp4',
            footer: 'Spanish 🇪🇸',
            hasRun: true,
        },
    },
    {
        id: 'gen3-video',
        type: 'workflow',
        position: { x: 650, y: 100 },
        data: {
            label: 'PewDiePie Germany',
            hasMenu: true,
            image: true,
            videoUrl: '/speaker.mp4',
            footer: 'German 🇩🇪',
            hasRun: true,
        },
    },
    {
        id: 'text-input-2',
        type: 'workflow',
        position: { x: 950, y: 0 },
        data: {
            label: 'Sponsor',
            content: 'Adding a sponsor to the video.',
        },
    },
    {
        id: 'align',
        type: 'workflow',
        position: { x: 950, y: 200 },
        data: {
            label: 'PewDiePie Arabia',
            hasMenu: true,
            image: true,
            videoUrl: '/speaker.mp4',
            footer: 'Arabic 🇸🇦',
            hasRun: true,
        },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e1',
        source: 'text-input-1',
        target: 'gen3-image',
        type: 'default',
        animated: false,
        style: {
            stroke: '#3b82f6',
            strokeWidth: 2.5,
            strokeLinecap: 'round',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20,
        },
    },
    {
        id: 'e2',
        source: 'image-input',
        target: 'gen3-image',
        type: 'default',
        animated: false,
        style: {
            stroke: '#3b82f6',
            strokeWidth: 2.5,
            strokeLinecap: 'round',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20,
        },
    },
    {
        id: 'e3',
        source: 'gen3-image',
        target: 'gen3-video',
        type: 'default',
        animated: false,
        style: {
            stroke: '#3b82f6',
            strokeWidth: 2.5,
            strokeLinecap: 'round',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20,
        },
    },
    {
        id: 'e4',
        source: 'text-input-2',
        target: 'align',
        type: 'default',
        animated: false,
        style: {
            stroke: '#3b82f6',
            strokeWidth: 2.5,
            strokeLinecap: 'round',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20,
        },
    },
    {
        id: 'e5',
        source: 'gen3-video',
        target: 'align',
        type: 'default',
        animated: false,
        style: {
            stroke: '#3b82f6',
            strokeWidth: 2.5,
            strokeLinecap: 'round',
        },
        markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 20,
            height: 20,
        },
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
                        type: 'default',
                        animated: false,
                        style: {
                            stroke: '#3b82f6',
                            strokeWidth: 2.5,
                            strokeLinecap: 'round',
                        },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#3b82f6',
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
                    <Background color="#e5e7eb" gap={16} />
                </ReactFlow>
            </div>
        </div>
    );
}
