import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, FolderKanban, LogOut } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import Avatar from '../common/Avatar';

function NavItem({ to, icon: Icon, label }) {
    return (
        <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
            <Icon className="nav-icon" size={17} />
            {label}
        </NavLink>
    );
}

export default function Sidebar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo">⚡ FlowBoard</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Project Management</div>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section-title">Navigation</div>
                <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem to="/projects" icon={FolderKanban} label="Projects" />
            </nav>
            <div className="sidebar-footer">
                <div className="user-chip">
                    <Avatar user={user} size="sm" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name || 'User'}
                        </div>
                        <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%', marginTop: 4 }}>
                    <LogOut size={16} /> Log out
                </button>
            </div>
        </aside>
    );
}
