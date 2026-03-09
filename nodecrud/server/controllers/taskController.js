const Task = require('../models/Task');
const Board = require('../models/Board');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

const isMember = (project, userId) =>
    project.members.some((m) => m.user.toString() === userId.toString());

// @desc  Create task
const createTask = async (req, res, next) => {
    try {
        const board = await Board.findById(req.params.boardId);
        if (!board) return errorResponse(res, 'Board not found', 404);
        const project = await Project.findById(board.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const count = await Task.countDocuments({ board: board._id });
        const task = await Task.create({
            ...req.body,
            board: board._id,
            project: project._id,
            order: count,
            activityLog: [{ action: `Task created by ${req.user.name}`, user: req.user._id }],
        });
        await task.populate([
            { path: 'assignee', select: 'name email avatar' },
            { path: 'activityLog.user', select: 'name avatar' },
        ]);
        return successResponse(res, task, 'Task created', 201);
    } catch (err) { next(err); }
};

// @desc  Get tasks for a board (with filters + pagination)
const getTasks = async (req, res, next) => {
    try {
        const board = await Board.findById(req.params.boardId);
        if (!board) return errorResponse(res, 'Board not found', 404);
        const project = await Project.findById(board.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const { status, priority, assignee, dueDate, q, page = 1, limit = 50 } = req.query;
        const filter = { board: board._id };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (assignee) filter.assignee = assignee;
        if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
        if (q) filter.$text = { $search: q };

        const total = await Task.countDocuments(filter);
        const tasks = await Task.find(filter)
            .populate('assignee', 'name email avatar')
            .sort({ order: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        return paginatedResponse(res, tasks, total, page, limit, 'Tasks fetched');
    } catch (err) { next(err); }
};

// @desc  Get single task
const getTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignee', 'name email avatar')
            .populate('board', 'title')
            .populate('project', 'title')
            .populate('activityLog.user', 'name avatar');
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);
        return successResponse(res, task, 'Task fetched');
    } catch (err) { next(err); }
};

// @desc  Update task
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const updatableFields = ['title', 'description', 'priority', 'dueDate', 'assignee', 'tags', 'order', 'board'];
        updatableFields.forEach((f) => { if (req.body[f] !== undefined) task[f] = req.body[f]; });

        task.activityLog.push({ action: `Task updated by ${req.user.name}`, user: req.user._id });
        await task.save();
        await task.populate([
            { path: 'assignee', select: 'name email avatar' },
            { path: 'activityLog.user', select: 'name avatar' },
        ]);
        return successResponse(res, task, 'Task updated');
    } catch (err) { next(err); }
};

// @desc  Update task status
const updateTaskStatus = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const oldStatus = task.status;
        task.status = req.body.status;
        task.activityLog.push({ action: `Status changed from "${oldStatus}" to "${req.body.status}" by ${req.user.name}`, user: req.user._id });
        await task.save();
        return successResponse(res, task, 'Status updated');
    } catch (err) { next(err); }
};

// @desc  Move task to different board
const moveTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const { boardId, order } = req.body;
        const newBoard = await Board.findById(boardId);
        if (!newBoard) return errorResponse(res, 'Target board not found', 404);

        task.board = boardId;
        if (order !== undefined) task.order = order;
        task.activityLog.push({ action: `Moved to board "${newBoard.title}" by ${req.user.name}`, user: req.user._id });
        await task.save();
        return successResponse(res, task, 'Task moved');
    } catch (err) { next(err); }
};

// @desc  Delete task
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);
        await Comment.deleteMany({ task: task._id });
        await task.deleteOne();
        return successResponse(res, null, 'Task deleted');
    } catch (err) { next(err); }
};

// @desc  Add comment
const addComment = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const comment = await Comment.create({ text: req.body.text, author: req.user._id, task: task._id });
        task.activityLog.push({ action: `${req.user.name} commented on the task`, user: req.user._id });
        await task.save();
        await comment.populate('author', 'name email avatar');
        return successResponse(res, comment, 'Comment added', 201);
    } catch (err) { next(err); }
};

// @desc  Get comments
const getComments = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return errorResponse(res, 'Task not found', 404);
        const project = await Project.findById(task.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const comments = await Comment.find({ task: task._id })
            .populate('author', 'name email avatar')
            .sort({ createdAt: 1 });
        return successResponse(res, comments, 'Comments fetched');
    } catch (err) { next(err); }
};

// @desc  Search tasks in a project
const searchTasks = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const { q, status, priority, assignee, dueDate, page = 1, limit = 20 } = req.query;
        const filter = { project: project._id };
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (assignee) filter.assignee = assignee;
        if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
        if (q) filter.$text = { $search: q };

        const total = await Task.countDocuments(filter);
        const tasks = await Task.find(filter)
            .populate('assignee', 'name email avatar')
            .populate('board', 'title')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        return paginatedResponse(res, tasks, total, page, limit, 'Search results');
    } catch (err) { next(err); }
};

module.exports = { createTask, getTasks, getTask, updateTask, updateTaskStatus, moveTask, deleteTask, addComment, getComments, searchTasks };
