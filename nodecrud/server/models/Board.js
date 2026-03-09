const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        order: { type: Number, default: 0 },
        color: { type: String, default: '#6366f1' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);
