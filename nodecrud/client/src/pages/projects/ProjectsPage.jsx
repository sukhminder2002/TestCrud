import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProjects, createProject, deleteProject } from '../../features/projects/projectsSlice';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { Plus, Trash2, Settings2, ArrowRight } from 'lucide-react';

function ProjectCard({ project, onOpen, onDelete }) {
    return (
        <div className="card card-hover project-card" style={{ '--card-color': project.color }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="project-card-title">{project.title}</div>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(project); }}
                    style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    <Trash2 size={14} />
                </button>
            </div>
            <div className="project-card-desc">{project.description || 'No description provided'}</div>
            <div className="project-card-footer">
                <div className="member-stack">
                    {project.members?.slice(0, 4).map((m) => (
                        <Avatar key={m.user?._id} user={m.user} size="sm" />
                    ))}
                    {project.members?.length > 4 && (
                        <div className="avatar avatar-sm" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                            +{project.members.length - 4}
                        </div>
                    )}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onOpen(project._id)}>
                    Open <ArrowRight size={13} />
                </button>
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: projects, loading } = useSelector((s) => s.projects);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ title: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [creating, setCreating] = useState(false);

    useEffect(() => { dispatch(fetchProjects()); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setCreating(true);
        const res = await dispatch(createProject(form));
        setCreating(false);
        if (!res.error) {
            toast.success('Project created!');
            setShowCreate(false);
            setForm({ title: '', description: '' });
        } else {
            toast.error(res.payload || 'Failed to create project');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const res = await dispatch(deleteProject(confirmDelete._id));
        if (!res.error) {
            toast.success('Project deleted');
            setConfirmDelete(null);
        } else {
            toast.error('Failed to delete project');
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div className="page-title">Projects</div>
                    <div className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} /> New Project
                </button>
            </div>

            {loading ? <Spinner /> : projects.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📁</div>
                    <div className="empty-state-title">No projects yet</div>
                    <div className="empty-state-desc">Create your first project to start organizing tasks with your team.</div>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowCreate(true)}>
                        <Plus size={16} /> Create Project
                    </button>
                </div>
            ) : (
                <div className="grid-3">
                    {projects.map((p) => (
                        <ProjectCard key={p._id} project={p}
                            onOpen={(id) => navigate(`/projects/${id}`)}
                            onDelete={setConfirmDelete} />
                    ))}
                </div>
            )}

            {showCreate && (
                <Modal title="Create New Project" onClose={() => setShowCreate(false)}
                    footer={
                        <>
                            <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                                {creating ? 'Creating…' : 'Create Project'}
                            </button>
                        </>
                    }>
                    <div className="form-group">
                        <label className="form-label">Project Title *</label>
                        <input className="form-input" placeholder="e.g. Marketing Website Redesign"
                            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" placeholder="What is this project about?"
                            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                </Modal>
            )}

            {confirmDelete && (
                <Modal title="Delete Project" onClose={() => setConfirmDelete(null)}
                    footer={
                        <>
                            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
                        </>
                    }>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>?
                        This will permanently delete all boards and tasks inside it.
                    </p>
                </Modal>
            )}
        </div>
    );
}
