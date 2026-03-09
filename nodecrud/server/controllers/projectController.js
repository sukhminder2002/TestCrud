const Project = require('../models/Project');
const User = require('../models/User');
const Board = require('../models/Board');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/response');

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];

// @desc  Create project
const createProject = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const project = await Project.create({ title, description, owner: req.user._id, color });
        await project.populate('members.user', 'name email avatar');
        return successResponse(res, project, 'Project created', 201);
    } catch (err) { next(err); }
};

// @desc  Get all projects for current user
const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ 'members.user': req.user._id })
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .sort({ createdAt: -1 });
        return successResponse(res, projects, 'Projects fetched');
    } catch (err) { next(err); }
};

// @desc  Get single project
const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar');
        if (!project) return errorResponse(res, 'Project not found', 404);
        const isMember = project.members.some((m) => m.user._id.toString() === req.user._id.toString());
        if (!isMember) return errorResponse(res, 'Access denied', 403);
        return successResponse(res, project, 'Project fetched');
    } catch (err) { next(err); }
};

// @desc  Update project
const updateProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (project.owner.toString() !== req.user._id.toString()) return errorResponse(res, 'Not authorized', 403);
        const { title, description, color } = req.body;
        if (title) project.title = title;
        if (description !== undefined) project.description = description;
        if (color) project.color = color;
        await project.save();
        await project.populate('members.user', 'name email avatar');
        return successResponse(res, project, 'Project updated');
    } catch (err) { next(err); }
};

// @desc  Delete project
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (project.owner.toString() !== req.user._id.toString()) return errorResponse(res, 'Not authorized', 403);
        // cascade delete
        const boards = await Board.find({ project: project._id });
        const boardIds = boards.map((b) => b._id);
        await Task.deleteMany({ board: { $in: boardIds } });
        await Board.deleteMany({ project: project._id });
        await project.deleteOne();
        return successResponse(res, null, 'Project deleted');
    } catch (err) { next(err); }
};

// @desc  Invite member by email
const inviteMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return errorResponse(res, 'Project not found', 404);
        const isOwnerOrAdmin = project.members.some(
            (m) => m.user.toString() === req.user._id.toString() && ['owner', 'admin'].includes(m.role)
        );
        if (!isOwnerOrAdmin) return errorResponse(res, 'Not authorized', 403);

        const invitee = await User.findOne({ email: req.body.email });
        if (!invitee) return errorResponse(res, 'User with that email not found', 404);

        const alreadyMember = project.members.some((m) => m.user.toString() === invitee._id.toString());
        if (alreadyMember) return errorResponse(res, 'User is already a member', 409);

        project.members.push({ user: invitee._id, role: req.body.role || 'member' });
        await project.save();
        await project.populate('members.user', 'name email avatar');
        return successResponse(res, project, 'Member invited');
    } catch (err) { next(err); }
};

// @desc  Remove member
const removeMember = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (project.owner.toString() !== req.user._id.toString()) return errorResponse(res, 'Not authorized', 403);
        if (req.params.userId === project.owner.toString()) return errorResponse(res, 'Cannot remove owner', 400);
        project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
        await project.save();
        return successResponse(res, project, 'Member removed');
    } catch (err) { next(err); }
};

module.exports = { createProject, getProjects, getProject, updateProject, deleteProject, inviteMember, removeMember };
