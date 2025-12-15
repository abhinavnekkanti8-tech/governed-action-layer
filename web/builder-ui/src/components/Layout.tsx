import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, GitBranch, Activity } from 'lucide-react';

export default function Layout() {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Workflows' },
        { to: '/runs', icon: Activity, label: 'Runs & Approvals' },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--color-border))' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'hsl(var(--color-primary))' }}>●</span> Anti-Gravity
                    </h2>
                </div>
                <nav style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                textDecoration: 'none',
                                color: isActive ? 'hsl(var(--color-text))' : 'hsl(var(--color-text-muted))',
                                background: isActive ? 'hsla(var(--color-primary) / 0.1)' : 'transparent',
                                fontWeight: isActive ? 600 : 400,
                            })}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                <header className="header">
                    <div style={{ color: 'hsl(var(--color-text-muted))' }}>Organization: Acme Corp</div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'hsl(var(--color-primary))' }}></div>
                    </div>
                </header>
                <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
