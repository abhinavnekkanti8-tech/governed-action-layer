import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_WORKFLOWS = [
    { id: 'wf-1', name: 'Refund Approval Process', description: 'Handles refunds over $500', updatedAt: '2 mins ago' },
    { id: 'wf-2', name: 'User Onboarding', description: 'Provision accounts and send emails', updatedAt: '1 day ago' },
];

export default function Dashboard() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Workflows</h1>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={18} /> New Workflow
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {MOCK_WORKFLOWS.map((wf) => (
                    <Link
                        key={wf.id}
                        to={`/workflow/${wf.id}`}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'transform 0.2s',
                            display: 'block'
                        }}
                    >
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{wf.name}</h3>
                        <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {wf.description}
                        </p>
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))' }}>
                            Updated {wf.updatedAt}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
