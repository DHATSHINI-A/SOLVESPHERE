const express = require('express');
const router = express.Router();
const {
    createProblem,
    getAllProblems,
    getMyProblems,
    getProblemById,
    updateProblem,
} = require('../controllers/problemController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/problems (Protected - create problem)
router.post('/', authMiddleware, createProblem);

// GET /api/problems (Public / General list with filters)
router.get('/', getAllProblems);

// GET /api/problems/my (Protected - logged-in user's problems)
router.get('/my', authMiddleware, getMyProblems);

// GET /api/problems/:id (Protected - single problem by ID with owner/admin access)
router.get('/:id', authMiddleware, getProblemById);

// PUT /api/problems/:id (Protected - update problem / change status)
router.put('/:id', authMiddleware, updateProblem);

module.exports = router;
