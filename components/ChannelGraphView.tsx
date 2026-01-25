import { useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    Panel,
    MarkerType,
    Node,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { MasterNode } from '@/lib/api'; // Import your types
import { useTheme } from '@/lib/useTheme'; // Your theme hook
import { Plus } from 'lucide-react';

// --- 1. Custom Node Component (The Card) ---
const ChannelNode = ({ data }: { data: any }) => {
    const { theme } = useTheme();
    const isMaster = data.type === 'master';

    // Reuse your existing theme classes
    const cardClass = theme === "light" ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700";
    const textClass = theme === "light" ? "text-gray-900" : "text-gray-100";

    return (
        <div className={`px-4 py-3 rounded-xl border-2 shadow-sm min-w-[200px] ${cardClass} ${data.isSelected ? 'border-yellow-500 ring-2 ring-yellow-500/20' : ''}`}>
            {/* Input Handle (Left) - Only for satellites */}
            {!isMaster && <Handle type="target" position={Position.Left} className="!bg-gray-400" />}

            <div className="flex items-center gap-3">
                <img
                    src={data.avatar}
                    alt={data.label}
                    className={`w-10 h-10 rounded-full object-cover border ${isMaster ? 'border-yellow-500' : 'border-gray-500'}`}
                />
                <div>
                    <div className={`text-sm font-medium ${textClass}`}>{data.label}</div>
                    <div className="text-xs text-gray-500">
                        {isMaster ? `${data.subLabel} Satellites` : data.subLabel}
                    </div>
                </div>
            </div>

            {/* Output Handle (Right) - Only for masters */}
            {isMaster && <Handle type="source" position={Position.Right} className="!bg-yellow-500" />}
        </div>
    );
};

// --- 2. Auto Layout Function (Dagre) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const nodeWidth = 220;
    const nodeHeight = 80;

    dagreGraph.setGraph({ rankdir: 'LR' }); // LR = Left to Right

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// --- 3. Main Component ---
export function ChannelGraphView({ masters, onAddConnection }: { masters: MasterNode[], onAddConnection: () => void }) {
    const { theme } = useTheme();
    const nodeTypes = useMemo(() => ({ channelCard: ChannelNode }), []);

    // Theme-aware styles
    const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
    const dotColor = theme === "light" ? "#ccc" : "#333";

    // Transform your API data into React Flow Nodes/Edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        masters.forEach((master) => {
            // Add Master Node
            nodes.push({
                id: master.connection_id,
                type: 'channelCard',
                data: {
                    label: master.channel_name,
                    avatar: master.channel_avatar_url,
                    type: 'master',
                    subLabel: master.language_channels.length
                },
                position: { x: 0, y: 0 }, // Position calculated by dagre later
            });

            // Add Satellite Nodes and Edges
            master.language_channels.forEach((lang) => {
                nodes.push({
                    id: lang.id,
                    type: 'channelCard',
                    data: {
                        label: lang.channel_name,
                        avatar: lang.channel_avatar_url,
                        type: 'satellite',
                        subLabel: lang.language_codes?.join(', ') || 'Global'
                    },
                    position: { x: 0, y: 0 },
                });

                edges.push({
                    id: `e-${master.connection_id}-${lang.id}`,
                    source: master.connection_id,
                    target: lang.id,
                    type: 'smoothstep', // Gives that squared-off family tree look
                    animated: true,
                    style: { stroke: '#64748b', strokeWidth: 2 },
                });
            });
        });

        return getLayoutedElements(nodes, edges);
    }, [masters]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className={`w-full h-full min-h-[500px] ${bgClass} rounded-xl overflow-hidden`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Controls className={theme === "dark" ? "bg-gray-800 fill-gray-100 border-gray-700" : ""} />
                <Background color={dotColor} gap={20} size={1} />
                <Panel position="top-right">
                    <button
                        onClick={onAddConnection}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === "light" ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-200"}`}
                    >
                        <Plus className="h-4 w-4" />
                        Add Channel
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    );
}
