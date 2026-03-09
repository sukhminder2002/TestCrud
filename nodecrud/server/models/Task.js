const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    action: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
});

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        status: {
            type: String,
            enum: ['todo', 'inprogress', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium',
        },
        dueDate: { type: Date, default: null },
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        order: { type: Number, default: 0 },
        tags: [{ type: String }],
        activityLog: [ActivitySchema],
    },
    { timestamps: true }
);

// Text index for search
TaskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
