import { useCallback } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Play } from 'lucide-react';

const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'Start Trigger' }, type: 'input' },
    { id: '2', position: { x: 100, y: 200 }, data: { label: 'HTTP Action' } },
    { id: '3', position: { x: 100, y: 300 }, data: { label: 'Manager Approval' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }, { id: 'e2-3', source: '2', target: '3' }];

export default function Editor() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    return (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Refund Approval Process</h2>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>Draft Version</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-primary" style={{ background: 'transparent', border: '1px solid hsl(var(--color-primary))' }}>
                        <Play size={16} /> Test Run
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Save size={16} /> Publish Skill
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background color="hsl(var(--color-border))" gap={16} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
