import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProjects } from '../../features/projects/projectsSlice';
import { LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color }) {
    return (
        <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: `${color}22`, borderRadius: '12px', padding: 12 }}>
                <Icon size={22} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: projects } = useSelector((s) => s.projects);

    useEffect(() => { dispatch(fetchProjects()); }, []);

    const totalProjects = projects.length;
    const recentProjects = projects.slice(0, 4);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Dashboard</div>
                    <div className="page-subtitle">Your workspace at a glance</div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/projects')}>
                    View all projects
                </button>
            </div>

            <div className="grid-3" style={{ marginBottom: 32 }}>
                <StatCard label="Total Projects" value={totalProjects} icon={FolderKanban} color="#6366f1" />
                <StatCard label="Active Boards" value="—" icon={LayoutDashboard} color="#8b5cf6" />
                <StatCard label="Open Tasks" value="—" icon={CheckSquare} color="#14b8a6" />
            </div>

            <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Recent Projects</div>
                {recentProjects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-title">No projects yet</div>
                        <div className="empty-state-desc">Create your first project to get started</div>
                    </div>
                ) : (
                    <div className="grid-3">
                        {recentProjects.map((p) => (
                            <div key={p._id} className="card card-hover project-card"
                                style={{ '--card-color': p.color }}
                                onClick={() => navigate(`/projects/${p._id}`)}>
                                <div className="project-card-title">{p.title}</div>
                                <div className="project-card-desc">{p.description || 'No description'}</div>
                                <div className="project-card-footer">
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {p.members?.length || 0} member{p.members?.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
