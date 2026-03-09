const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createTask, getTasks } = require('../controllers/taskController');
const { updateBoard, deleteBoard } = require('../controllers/boardController');

router.use(protect);

// Task routes under /api/boards/:boardId/tasks
router.route('/:boardId/tasks').get(getTasks).post(createTask);

// Board CRUD under /api/boards/:boardId
router.route('/:boardId').put(updateBoard).delete(deleteBoard);

module.exports = router;
