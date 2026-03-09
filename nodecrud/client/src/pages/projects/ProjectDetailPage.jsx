import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProject, inviteMember, removeMember, updateProject } from '../../features/projects/projectsSlice';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import { ArrowRight, UserPlus, Trash2, LayoutGrid } from 'lucide-react';

export default function ProjectDetailPage() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { current: project } = useSelector((s) => s.projects);
    const { user } = useSelector((s) => s.auth);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);

    useEffect(() => { dispatch(fetchProject(id)); }, [id]);

    if (!project) return <Spinner />;

    const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviting(true);
        const res = await dispatch(inviteMember({ id, data: { email: inviteEmail } }));
        setInviting(false);
        if (!res.error) {
            toast.success('Member invited!');
            setShowInvite(false);
            setInviteEmail('');
        } else {
            toast.error(res.payload || 'Failed to invite');
        }
    };

    const handleRemove = async (userId) => {
        const res = await dispatch(removeMember({ id, userId }));
        if (!res.error) toast.success('Member removed');
        else toast.error(res.payload || 'Failed to remove member');
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="page-title">{project.title}</div>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: project.color, display: 'inline-block' }} />
                    </div>
                    <div className="page-subtitle">{project.description || 'No description'}</div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(`/projects/${id}/boards`)}>
                    <LayoutGrid size={16} /> Open Board
                </button>
            </div>

            {/* Members */}
            <div className="card" style={{ padding: 24, maxWidth: 640 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700 }}>Team Members ({project.members?.length})</div>
                    {isOwner && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowInvite(true)}>
                            <UserPlus size={14} /> Invite
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {project.members?.map((m) => (
                        <div key={m.user?._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <Avatar user={m.user} size="md" />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.user?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user?.email}</div>
                            </div>
                            <span className={`badge badge-${m.role === 'owner' ? 'done' : m.role === 'admin' ? 'inprogress' : 'todo'}`}>
                                {m.role}
                            </span>
                            {isOwner && m.role !== 'owner' && (
                                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => handleRemove(m.user?._id)} style={{ color: 'var(--red)' }}>
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showInvite && (
                <Modal title="Invite Member" onClose={() => setShowInvite(false)}
                    footer={
                        <>
                            <button className="btn btn-ghost" onClick={() => setShowInvite(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleInvite} disabled={inviting}>
                                {inviting ? 'Inviting…' : <><UserPlus size={14} /> Send Invite</>}
                            </button>
                        </>
                    }>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input type="email" className="form-input" placeholder="teammate@example.com" autoFocus
                            value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        The user must already have an account with this email address.
                    </p>
                </Modal>
            )}
        </div>
    );
}
