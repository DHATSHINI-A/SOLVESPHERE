const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validation: Required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password.'
            });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();

        // 2. Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // 3. Password length check
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long.'
            });
        }

        // 4. Check if user already exists
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A user with this email address already exists.'
            });
        }

        // 5. Hash password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 6. Insert new user into database
        const userRole = role && typeof role === 'string' && role.trim() ? role.trim() : 'user';
        const insertQuery = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at;
        `;
        const result = await query(insertQuery, [
            trimmedName,
            trimmedEmail,
            hashedPassword,
            userRole
        ]);

        const newUser = result.rows[0];

        // 7. Return created user without password
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Error in register controller:', error);
        next(error);
    }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT token
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Validation: Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        const trimmedEmail = email.trim().toLowerCase();

        // 2. Find user by email
        const result = await query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = result.rows[0];

        // 3. Compare password with bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // 4. Sign JWT containing user_id and role
        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_123';
        const payload = {
            user_id: user.id,
            id: user.id,
            role: user.role,
            email: user.email,
        };

        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: '24h',
        });

        // 5. Return token and user data without password
        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error('Error in login controller:', error);
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user profile
 * @access  Private (Protected by authMiddleware)
 */
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.user_id || req.user.id;
        if (!userId) {
            return res.status(200).json({
                success: true,
                user: req.user
            });
        }

        const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);

        if (result && result.rows && result.rows.length > 0) {
            return res.status(200).json({
                success: true,
                user: result.rows[0]
            });
        }

        return res.status(200).json({
            success: true,
            user: req.user
        });
    } catch (error) {
        // Return attached token payload if database is in disconnected/test mode
        return res.status(200).json({
            success: true,
            user: req.user,
            warning: 'Fetched from verified JWT token'
        });
    }
};

module.exports = {
    register,
    login,
    getMe,
};
