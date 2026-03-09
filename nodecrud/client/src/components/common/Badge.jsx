const statusMap = { todo: 'todo', inprogress: 'inprogress', done: 'done' };
const priorityMap = { low: 'low', medium: 'medium', high: 'high', critical: 'critical' };
const labelMap = {
    todo: 'Todo', inprogress: 'In Progress', done: 'Done',
    low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

export default function Badge({ type, value }) {
    const cls = type === 'status' ? statusMap[value] : priorityMap[value];
    return <span className={`badge badge-${cls}`}>{labelMap[value] || value}</span>;
}
