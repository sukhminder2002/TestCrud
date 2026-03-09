const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTask, updateTask, updateTaskStatus, moveTask, deleteTask, addComment, getComments } = require('../controllers/taskController');

router.use(protect);

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.put('/:id/move', moveTask);
router.route('/:id/comments').get(getComments).post(addComment);

module.exports = router;
