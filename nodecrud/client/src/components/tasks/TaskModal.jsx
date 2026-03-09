import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { taskAPI } from '../../api';
import { updateTask, deleteTask } from '../../features/tasks/tasksSlice';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import { Trash2, Send, Clock, User, Flag } from 'lucide-react';

export default function TaskModal({ task: initialTask, onClose, members = [] }) {
    const dispatch = useDispatch();
    const [task, setTask] = useState(initialTask);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        title: initialTask.title,
        description: initialTask.description || '',
        priority: initialTask.priority,
        status: initialTask.status,
        assignee: initialTask.assignee?._id || '',
        dueDate: initialTask.dueDate ? initialTask.dueDate.substring(0, 10) : '',
    });

    useEffect(() => {
        taskAPI.getComments(initialTask._id).then((r) => setComments(r.data.data));
    }, [initialTask._id]);

    const handleSave = async () => {
        const res = await dispatch(updateTask({ id: task._id, data: form }));
        if (!res.error) { toast.success('Task updated'); setEditing(false); setTask(res.payload); }
        else toast.error('Failed to update task');
    };

    const handleDelete = async () => {
        const res = await dispatch(deleteTask(task._id));
        if (!res.error) { toast.success('Task deleted'); onClose(); }
        else toast.error('Failed to delete');
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        const res = await taskAPI.addComment(task._id, newComment);
        setComments([...comments, res.data.data]);
        setNewComment('');
    };

    const sidebarField = (label, children) => (
        <div style={{ marginBottom: 16 }}>
            <div className="task-label">{label}</div>
            {children}
        </div>
    );

    return (
        <Modal title="" onClose={onClose} wide>
            <div className="task-detail-grid">
                {/* Left: main content */}
                <div>
                    {editing ? (
                        <input className="form-input" value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }} />
                    ) : (
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12, cursor: 'pointer' }}
                            onClick={() => setEditing(true)}>
                            {task.title}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <Badge type="status" value={task.status} />
                        <Badge type="priority" value={task.priority} />
                    </div>

                    <div className="task-label" style={{ marginBottom: 8 }}>Description</div>
                    {editing ? (
                        <textarea className="form-input" rows={5} value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
                    ) : (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16, minHeight: 60, cursor: 'pointer', padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}
                            onClick={() => setEditing(true)}>
                            {task.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Click to add description…</span>}
                        </div>
                    )}

                    {editing && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                        </div>
                    )}

                    {/* Activity */}
                    {task.activityLog?.length > 0 && (
                        <>
                            <div className="task-label" style={{ marginBottom: 8 }}>Activity</div>
                            <div className="activity-list">
                                {task.activityLog.slice().reverse().map((a, i) => (
                                    <div className="activity-item" key={i}>
                                        <Avatar user={a.user} size="sm" />
                                        <div>
                                            <div className="activity-text">{a.action}</div>
                                            <div className="activity-time">{a.createdAt ? format(new Date(a.createdAt), 'MMM d, h:mm a') : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Comments */}
                    <div className="task-label" style={{ marginTop: 20, marginBottom: 8 }}>Comments ({comments.length})</div>
                    <div className="comment-list">
                        {comments.map((c) => (
                            <div className="comment-item" key={c._id}>
                                <Avatar user={c.author} size="sm" />
                                <div className="comment-bubble">
                                    <div className="comment-author">{c.author?.name}</div>
                                    <div className="comment-text">{c.text}</div>
                                    <div className="comment-time">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <input className="form-input" placeholder="Add a comment…" style={{ flex: 1 }}
                            value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                        <button type="submit" className="btn btn-primary btn-sm"><Send size={14} /></button>
                    </form>
                </div>

                {/* Right: sidebar details */}
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 20 }}>
                    {editing ? (
                        <>
                            {sidebarField('Status',
                                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    <option value="todo">Todo</option>
                                    <option value="inprogress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            )}
                            {sidebarField('Priority',
                                <select className="form-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            )}
                            {sidebarField('Assignee',
                                <select className="form-input" value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
                                    <option value="">Unassigned</option>
                                    {members.map((m) => (
                                        <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                                    ))}
                                </select>
                            )}
                            {sidebarField('Due Date',
                                <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                            )}
                        </>
                    ) : (
                        <>
                            {sidebarField('Assignee',
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {task.assignee ? <><Avatar user={task.assignee} size="sm" /><span style={{ fontSize: '0.85rem' }}>{task.assignee.name}</span></> : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassigned</span>}
                                </div>
                            )}
                            {sidebarField('Due Date',
                                <div className={`due-date ${task.dueDate && new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                                    <Clock size={12} />
                                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                                </div>
                            )}
                        </>
                    )}
                    <div className="divider" style={{ margin: '20px 0' }} />
                    <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete}>
                        <Trash2 size={14} /> Delete Task
                    </button>
                </div>
            </div>
        </Modal>
    );
}
