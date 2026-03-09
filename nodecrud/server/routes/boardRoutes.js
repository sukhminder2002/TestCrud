const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { updateBoard, deleteBoard } = require('../controllers/boardController');
const { createTask, getTasks } = require('../controllers/taskController');

router.use(protect);

router.route('/:boardId').put(updateBoard).delete(deleteBoard);
router.route('/:boardId/tasks').get(getTasks).post(createTask);

module.exports = router;
