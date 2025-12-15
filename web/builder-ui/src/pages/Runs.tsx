import { CheckCircle, XCircle, Clock } from 'lucide-react';

const MOCK_RUNS = [
    { id: 'run-123', workflow: 'Refund Approval', triggeredBy: 'Agent #1', status: 'COMPLETED', time: '10 mins ago' },
    { id: 'run-124', workflow: 'User Onboarding', triggeredBy: 'Agent #1', status: 'WAITING_APPROVAL', time: '1 hour ago' },
    { id: 'run-125', workflow: 'Refund Approval', triggeredBy: 'Manual', status: 'FAILED', time: '2 hours ago' },
];

export default function Runs() {
    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem' }}>Runs & Approvals</h1>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'hsla(var(--color-surface) / 0.5)', borderBottom: '1px solid hsl(var(--color-border))' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>Run ID</th>
                            <th style={{ padding: '1rem' }}>Workflow</th>
                            <th style={{ padding: '1rem' }}>Invoker</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_RUNS.map(run => (
                            <tr key={run.id} style={{ borderBottom: '1px solid hsla(var(--color-border) / 0.3)' }}>
                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{run.id}</td>
                                <td style={{ padding: '1rem' }}>{run.workflow}</td>
                                <td style={{ padding: '1rem' }}>{run.triggeredBy}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {run.status === 'COMPLETED' && <CheckCircle size={16} color="green" />}
                                        {run.status === 'FAILED' && <XCircle size={16} color="red" />}
                                        {run.status === 'WAITING_APPROVAL' && <Clock size={16} color="orange" />}
                                        {run.status}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'hsl(var(--color-text-muted))' }}>{run.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
