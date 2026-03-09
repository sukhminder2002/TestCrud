import { useSelector } from 'react-redux';
import { Bell } from 'lucide-react';
import Avatar from '../common/Avatar';

export default function Header() {
    const { user } = useSelector((s) => s.auth);
    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Welcome back,</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn-icon btn-ghost">
                    <Bell size={18} color="var(--text-secondary)" />
                </button>
                <Avatar user={user} size="sm" />
            </div>
        </header>
    );
}
