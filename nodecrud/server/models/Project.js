const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
            },
        ],
        color: {
            type: String,
            default: '#6366f1',
        },
    },
    { timestamps: true }
);

// Ensure owner is always in members
ProjectSchema.pre('save', function () {
    const ownerExists = this.members.some((m) => m.user.toString() === this.owner.toString());
    if (!ownerExists) {
        this.members.unshift({ user: this.owner, role: 'owner' });
    }
});

module.exports = mongoose.model('Project', ProjectSchema);
