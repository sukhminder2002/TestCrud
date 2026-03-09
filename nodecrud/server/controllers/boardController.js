const Board = require('../models/Board');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/response');

const isMember = (project, userId) =>
    project.members.some((m) => m.user.toString() === userId.toString());

// @desc  Create board
const createBoard = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);

        const count = await Board.countDocuments({ project: project._id });
        const board = await Board.create({
            title: req.body.title,
            color: req.body.color || '#6366f1',
            project: project._id,
            order: count,
        });
        return successResponse(res, board, 'Board created', 201);
    } catch (err) { next(err); }
};

// @desc  Get all boards for project
const getBoards = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) return errorResponse(res, 'Project not found', 404);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);
        const boards = await Board.find({ project: project._id }).sort({ order: 1 });
        return successResponse(res, boards, 'Boards fetched');
    } catch (err) { next(err); }
};

// @desc  Update board
const updateBoard = async (req, res, next) => {
    try {
        const board = await Board.findById(req.params.boardId);
        if (!board) return errorResponse(res, 'Board not found', 404);
        const project = await Project.findById(board.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);
        const { title, color, order } = req.body;
        if (title) board.title = title;
        if (color) board.color = color;
        if (order !== undefined) board.order = order;
        await board.save();
        return successResponse(res, board, 'Board updated');
    } catch (err) { next(err); }
};

// @desc  Delete board
const deleteBoard = async (req, res, next) => {
    try {
        const board = await Board.findById(req.params.boardId);
        if (!board) return errorResponse(res, 'Board not found', 404);
        const project = await Project.findById(board.project);
        if (!isMember(project, req.user._id)) return errorResponse(res, 'Access denied', 403);
        await Task.deleteMany({ board: board._id });
        await board.deleteOne();
        return successResponse(res, null, 'Board deleted');
    } catch (err) { next(err); }
};

module.exports = { createBoard, getBoards, updateBoard, deleteBoard };
