const { query } = require('../config/database');

/**
 * @route   POST /api/problems
 * @desc    Create a new problem statement
 * @access  Private (Protected by authMiddleware)
 */
const createProblem = async (req, res, next) => {
    try {
        const {
            title,
            description,
            category,
            location,
            urgency,
            image_url,
            file_url,
        } = req.body;

        // 1. Validation: Required fields
        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and category.'
            });
        }

        // 2. Extract user_id from verified JWT
        const userId = req.user && (req.user.user_id || req.user.id);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Invalid user token.'
            });
        }

        // 3. Normalize optional values
        const problemUrgency = urgency && typeof urgency === 'string' ? urgency.toUpperCase() : 'MEDIUM';
        const problemStatus = 'SUBMITTED';

        const insertQuery = `
            INSERT INTO problems (
                user_id,
                title,
                description,
                category,
                location,
                urgency,
                image_url,
                file_url,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, user_id, title, description, category, location, urgency, image_url, file_url, status, created_at;
        `;

        const values = [
            userId,
            title.trim(),
            description.trim(),
            category.trim(),
            location && typeof location === 'string' ? location.trim() : null,
            problemUrgency,
            image_url || null,
            file_url || null,
            problemStatus,
        ];

        const result = await query(insertQuery, values);
        const createdProblem = result.rows[0];

        return res.status(201).json({
            success: true,
            message: 'Problem submitted successfully',
            problem: createdProblem,
        });
    } catch (error) {
        console.error('Error in createProblem controller:', error);
        next(error);
    }
};

/**
 * @route   GET /api/problems/my
 * @desc    Get all problems created by the logged-in user
 * @access  Private (Protected by authMiddleware)
 */
const getMyProblems = async (req, res, next) => {
    try {
        const userId = req.user && (req.user.user_id || req.user.id);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Invalid user token.'
            });
        }

        const queryText = `
            SELECT 
                id,
                user_id,
                title,
                description,
                category,
                location,
                urgency,
                image_url,
                file_url,
                status,
                created_at
            FROM problems
            WHERE user_id = $1
            ORDER BY created_at DESC;
        `;

        const result = await query(queryText, [userId]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            problems: result.rows,
        });
    } catch (error) {
        console.error('Error in getMyProblems controller:', error);
        next(error);
    }
};

/**
 * @route   GET /api/problems/:id
 * @desc    Get a single problem statement by ID
 * @access  Private (Owner or Admin/Mentor)
 */
const getProblemById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Validate ID parameter
        const problemId = parseInt(id, 10);
        if (isNaN(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid problem ID. ID must be a positive integer.'
            });
        }

        // 2. Query problem joined with user info
        const queryText = `
            SELECT 
                p.id,
                p.user_id,
                u.name AS submitter_name,
                u.email AS submitter_email,
                p.title,
                p.description,
                p.category,
                p.location,
                p.urgency,
                p.image_url,
                p.file_url,
                p.status,
                p.created_at
            FROM problems p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.id = $1;
        `;

        const result = await query(queryText, [problemId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Problem statement not found.'
            });
        }

        const problem = result.rows[0];
        const currentUserId = req.user && (req.user.user_id || req.user.id);
        const currentUserRole = req.user && req.user.role;

        // 3. Authorization Check: Owner or Admin/Mentor
        const isOwner = Number(problem.user_id) === Number(currentUserId);
        const isAdminOrMentor = currentUserRole === 'admin' || currentUserRole === 'mentor';

        if (!isOwner && !isAdminOrMentor) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: You do not have permission to view this problem.'
            });
        }

        return res.status(200).json({
            success: true,
            problem,
        });
    } catch (error) {
        console.error('Error in getProblemById controller:', error);
        next(error);
    }
};

/**
 * @route   GET /api/problems
 * @desc    Get all problems (with optional filtering by category, status, urgency, search, pagination)
 * @access  Public
 */
const getAllProblems = async (req, res, next) => {
    try {
        const { category, status, urgency, search, limit = 50, page = 1 } = req.query;

        const queryConditions = [];
        const queryParams = [];
        let paramIndex = 1;

        if (category) {
            queryConditions.push(`p.category ILIKE $${paramIndex++}`);
            queryParams.push(`%${category}%`);
        }

        if (status) {
            queryConditions.push(`p.status = $${paramIndex++}`);
            queryParams.push(status.toUpperCase());
        }

        if (urgency) {
            queryConditions.push(`p.urgency = $${paramIndex++}`);
            queryParams.push(urgency.toUpperCase());
        }

        if (search) {
            queryConditions.push(`(p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';
        const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
        const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
        const offset = (parsedPage - 1) * parsedLimit;

        const queryText = `
            SELECT 
                p.id,
                p.user_id,
                u.name AS submitter_name,
                u.email AS submitter_email,
                p.title,
                p.description,
                p.category,
                p.location,
                p.urgency,
                p.image_url,
                p.file_url,
                p.status,
                p.created_at
            FROM problems p
            LEFT JOIN users u ON p.user_id = u.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex++};
        `;

        queryParams.push(parsedLimit, offset);

        const result = await query(queryText, queryParams);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            page: parsedPage,
            problems: result.rows,
        });
    } catch (error) {
        console.error('Error in getAllProblems controller:', error);
        next(error);
    }
};

/**
 * @route   PUT /api/problems/:id
 * @desc    Update a problem statement or status
 * @access  Private (Owner or Admin/Mentor)
 */
const updateProblem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const problemId = parseInt(id, 10);

        if (isNaN(problemId) || problemId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid problem ID. Must be a positive integer.'
            });
        }

        // 1. Check if problem exists
        const existingRes = await query('SELECT * FROM problems WHERE id = $1', [problemId]);
        if (existingRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Problem statement not found.'
            });
        }

        const existingProblem = existingRes.rows[0];
        const currentUserId = req.user && (req.user.user_id || req.user.id);
        const currentUserRole = req.user && req.user.role;

        const isOwner = Number(existingProblem.user_id) === Number(currentUserId);
        const isAdminOrMentor = currentUserRole === 'admin' || currentUserRole === 'mentor';

        if (!isOwner && !isAdminOrMentor) {
            return res.status(403).json({
                success: false,
                message: 'Access forbidden: You do not have permission to edit this problem.'
            });
        }

        // 2. Extract editable fields
        const {
            title,
            description,
            category,
            location,
            urgency,
            image_url,
            file_url,
            status,
        } = req.body;

        const updatedTitle = title !== undefined ? title.trim() : existingProblem.title;
        const updatedDescription = description !== undefined ? description.trim() : existingProblem.description;
        const updatedCategory = category !== undefined ? category.trim() : existingProblem.category;
        const updatedLocation = location !== undefined ? location.trim() : existingProblem.location;
        const updatedUrgency = urgency !== undefined ? urgency.toUpperCase() : existingProblem.urgency;
        const updatedImageUrl = image_url !== undefined ? image_url : existingProblem.image_url;
        const updatedFileUrl = file_url !== undefined ? file_url : existingProblem.file_url;
        
        // Status can be updated by admin/mentor, or owner
        const updatedStatus = (isAdminOrMentor || isOwner) && status !== undefined 
            ? status.toUpperCase() 
            : existingProblem.status;

        const updateQuery = `
            UPDATE problems
            SET 
                title = $1,
                description = $2,
                category = $3,
                location = $4,
                urgency = $5,
                image_url = $6,
                file_url = $7,
                status = $8
            WHERE id = $9
            RETURNING id, user_id, title, description, category, location, urgency, image_url, file_url, status, created_at;
        `;

        const updateValues = [
            updatedTitle,
            updatedDescription,
            updatedCategory,
            updatedLocation,
            updatedUrgency,
            updatedImageUrl,
            updatedFileUrl,
            updatedStatus,
            problemId
        ];

        const result = await query(updateQuery, updateValues);

        return res.status(200).json({
            success: true,
            message: 'Problem updated successfully',
            problem: result.rows[0]
        });
    } catch (error) {
        console.error('Error in updateProblem controller:', error);
        next(error);
    }
};

module.exports = {
    createProblem,
    getAllProblems,
    getMyProblems,
    getProblemById,
    updateProblem,
};
