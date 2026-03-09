const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createProject, getProjects, getProject,
    updateProject, deleteProject, inviteMember, removeMember,
} = require('../controllers/projectController');
const { createBoard, getBoards } = require('../controllers/boardController');
const { searchTasks } = require('../controllers/taskController');

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.route('/:projectId/boards').get(getBoards).post(createBoard);
router.get('/:projectId/search', searchTasks);

module.exports = router;
