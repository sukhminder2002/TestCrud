import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fetchProject } from '../../features/projects/projectsSlice';
import { fetchBoards, createBoard } from '../../features/boards/boardsSlice';
import { fetchTasks, createTask, moveTask, optimisticMove, setFilters, clearFilters } from '../../features/tasks/tasksSlice';
import TaskModal from '../../components/tasks/TaskModal';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { Plus, Search, Filter, Calendar, X } from 'lucide-react';

// ---- Task Card ----
function TaskCard({ task, index, onOpen }) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                    onClick={() => onOpen(task)}>
                    <div className="task-card-title">{task.title}</div>
                    {task.tags?.length > 0 && (
                        <div className="task-card-tags">
                            {task.tags.map((tag, i) => <span key={i} className="task-tag">{tag}</span>)}
                        </div>
                    )}
                    <div className="task-card-meta">
                        <Badge type="priority" value={task.priority} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {task.dueDate && (
                                <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                                    <Calendar size={11} />
                                    {format(new Date(task.dueDate), 'MMM d')}
                                </div>
                            )}
                            {task.assignee && <Avatar user={task.assignee} size="sm" />}
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}

// ---- Column ----
function KanbanColumn({ board, tasks, onAddTask, onOpenTask }) {
    return (
        <div className="kanban-column">
            <div className="kanban-column-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: board.color }} />
                    <span className="kanban-column-title">{board.title}</span>
                    <span className="column-count">{tasks.length}</span>
                </div>
                <button className="btn btn-icon btn-ghost btn-sm" onClick={() => onAddTask(board)}>
                    <Plus size={15} />
                </button>
            </div>
            <Droppable droppableId={board._id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-tasks ${snapshot.isDraggingOver ? 'drag-over' : ''}`}>
                        {tasks.map((task, i) => (
                            <TaskCard key={task._id} task={task} index={i} onOpen={onOpenTask} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}

// ---- Main Board Page ----
export default function BoardPage() {
    const { id: projectId } = useParams();
    const dispatch = useDispatch();
    const { current: project } = useSelector((s) => s.projects);
    const { list: boards, loading: boardsLoading } = useSelector((s) => s.boards);
    const { byBoard, filters } = useSelector((s) => s.tasks);

    const [selectedTask, setSelectedTask] = useState(null);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const [targetBoard, setTargetBoard] = useState(null);
    const [columnTitle, setColumnTitle] = useState('');
    const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
    const [showFilter, setShowFilter] = useState(false);
    const [searchQ, setSearchQ] = useState('');

    useEffect(() => {
        dispatch(fetchProject(projectId));
        dispatch(fetchBoards(projectId));
    }, [projectId]);

    useEffect(() => {
        boards.forEach((board) => {
            dispatch(fetchTasks({ boardId: board._id, params: {} }));
        });
    }, [boards.length]);

    const getTasksForBoard = useCallback((boardId) => {
        let tasks = byBoard[boardId] || [];
        if (filters.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
        if (filters.status) tasks = tasks.filter((t) => t.status === filters.status);
        if (filters.assignee) tasks = tasks.filter((t) => t.assignee?._id === filters.assignee);
        if (searchQ) tasks = tasks.filter((t) => t.title.toLowerCase().includes(searchQ.toLowerCase()) || t.description?.toLowerCase().includes(searchQ.toLowerCase()));
        return tasks;
    }, [byBoard, filters, searchQ]);

    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceBoard = source.droppableId;
        const destBoard = destination.droppableId;
        const task = (byBoard[sourceBoard] || []).find((t) => t._id === draggableId);
        if (!task) return;

        // Optimistic update
        dispatch(optimisticMove({ task, sourceBoardId: sourceBoard, destBoardId: destBoard, destIndex: destination.index }));

        // Persist
        const res = await dispatch(moveTask({ id: draggableId, boardId: destBoard, order: destination.index }));
        if (res.error) {
            toast.error('Failed to move task');
            // Revert by refetching
            boards.forEach((b) => dispatch(fetchTasks({ boardId: b._id, params: {} })));
        }
    };

    const handleAddColumn = async (e) => {
        e.preventDefault();
        if (!columnTitle.trim()) return;
        const res = await dispatch(createBoard({ projectId, data: { title: columnTitle } }));
        if (!res.error) {
            toast.success('Column added');
            setShowAddColumn(false);
            setColumnTitle('');
            dispatch(fetchTasks({ boardId: res.payload._id, params: {} }));
        } else {
            toast.error('Failed to add column');
        }
    };


    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!taskForm.title.trim() || !targetBoard) return;
        const data = { ...taskForm };
        if (!data.dueDate) delete data.dueDate;
        if (!data.assignee) delete data.assignee;
        console.log('createTask ->', { boardId: targetBoard._id, data });

        try {
            const payload = await dispatch(createTask({ boardId: targetBoard._id, data })).unwrap();
            console.log('createTask success payload:', payload);
            toast.success('Task created!');
            setShowAddTask(false);
            setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignee: '' });
        } catch (err) {
            console.error('createTask failed:', err);
            const msg = err?.message || err?.data?.message || 'Failed to create task';
            toast.error(msg);
        }
    };

    const openAddTask = (board) => {
        setTargetBoard(board);
        setShowAddTask(true);
    };

    const anyFiltersActive = filters.priority || filters.status || filters.assignee || searchQ;

    if (boardsLoading && boards.length === 0) return <Spinner />;

    return (
        <div className="page" style={{ overflowX: 'hidden' }}>
            {/* Page header */}
            <div className="page-header">
                <div>
                    <div className="page-title">{project?.title || 'Board'}</div>
                    <div className="page-subtitle">Kanban View</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {anyFiltersActive && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { dispatch(clearFilters()); setSearchQ(''); }}>
                            <X size={14} /> Clear Filters
                        </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowFilter(!showFilter)}>
                        <Filter size={15} /> Filter
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddColumn(true)}>
                        <Plus size={15} /> Add Column
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            {showFilter && (
                <div className="filter-bar" style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 16, border: '1px solid var(--border)' }}>
                    <div className="search-input-wrap" style={{ maxWidth: 280 }}>
                        <Search size={15} className="search-icon" />
                        <input className="form-input" placeholder="Search tasks…" value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)} />
                    </div>
                    <select className="form-input" style={{ width: 'auto' }} value={filters.priority}
                        onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}>
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    <select className="form-input" style={{ width: 'auto' }} value={filters.status}
                        onChange={(e) => dispatch(setFilters({ status: e.target.value }))}>
                        <option value="">All Status</option>
                        <option value="todo">Todo</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                    <select className="form-input" style={{ width: 'auto' }} value={filters.assignee}
                        onChange={(e) => dispatch(setFilters({ assignee: e.target.value }))}>
                        <option value="">All Assignees</option>
                        {project?.members?.map((m) => (
                            <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="kanban-wrapper">
                    {boards.map((board) => (
                        <KanbanColumn
                            key={board._id}
                            board={board}
                            tasks={getTasksForBoard(board._id)}
                            onAddTask={openAddTask}
                            onOpenTask={setSelectedTask}
                        />
                    ))}
                    <button className="add-column-btn" onClick={() => setShowAddColumn(true)}>
                        <Plus size={18} /> Add Column
                    </button>
                </div>
            </DragDropContext>

            {boards.length === 0 && !boardsLoading && (
                <div className="empty-state">
                    <div className="empty-state-icon">🗂️</div>
                    <div className="empty-state-title">No columns yet</div>
                    <div className="empty-state-desc">Add your first column to start organizing tasks. For example: "Todo", "In Progress", "Done".</div>
                    <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setShowAddColumn(true)}>
                        <Plus size={16} /> Add First Column
                    </button>
                </div>
            )}

            {/* Add Column Modal */}
            {showAddColumn && (
                <Modal title="Add Column" onClose={() => setShowAddColumn(false)}
                    footer={
                        <>
                            <button className="btn btn-ghost" onClick={() => setShowAddColumn(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddColumn}>Add Column</button>
                        </>
                    }>
                    <div className="form-group">
                        <label className="form-label">Column Name</label>
                        <input className="form-input" placeholder="e.g. In Review" autoFocus
                            value={columnTitle} onChange={(e) => setColumnTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddColumn(e)} />
                    </div>
                </Modal>
            )}

            {/* Add Task Modal */}
            {showAddTask && targetBoard && (
                <Modal title={`Add Task to "${targetBoard.title}"`} onClose={() => setShowAddTask(false)}
                    footer={
                        <>
                            <button className="btn btn-ghost" onClick={() => setShowAddTask(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddTask}>Create Task</button>
                        </>
                    }>
                    <div className="form-group">
                        <label className="form-label">Title *</label>
                        <input className="form-input" placeholder="Task title" autoFocus
                            value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" placeholder="Optional description"
                            value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select className="form-input" value={taskForm.priority}
                                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input type="date" className="form-input" value={taskForm.dueDate}
                                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Assign to</label>
                        <select className="form-input" value={taskForm.assignee}
                            onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}>
                            <option value="">Unassigned</option>
                            {project?.members?.map((m) => (
                                <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                            ))}
                        </select>
                    </div>
                </Modal>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    members={project?.members || []}
                    onClose={() => setSelectedTask(null)}
                />
            )}
        </div>
    );
}
