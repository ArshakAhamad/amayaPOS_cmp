import express from 'express';
import pool from '../config/db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Enhanced authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ 
                success: false,
                message: 'Authorization header missing' 
            });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Authentication token missing' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Enhanced user verification
        const [user] = await pool.execute(
            'SELECT id, username, role FROM system_user WHERE id = ? AND status = "Active"', 
            [decoded.id]
        );

        if (user.length === 0) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found or inactive' 
            });
        }

        req.user = {
            id: user[0].id,
            username: user[0].username,
            role: user[0].role // Include role in request object
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid or expired token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Enhanced role checking endpoint
router.get('/check-role', authenticateUser, async (req, res) => {
    try {
        // Check sales rep status only if needed (optimization)
        if (req.user.role === 'Cashier') {
            return res.json({
                success: true,
                role: 'Cashier',
                isSalesRep: true, // Cashiers are always considered sales reps
                store: 'Default Store', // Or fetch from DB if cashiers have specific stores
                username: req.user.username
            });
        }

        // For Admins, check sales rep allocation
        const [salesRep] = await pool.execute(
            `SELECT store FROM sales_rep 
             WHERE user_name = ? AND status = 'Active'`,
            [req.user.username]
        );

        const isSalesRep = salesRep.length > 0;
        
        if (req.user.role === 'Admin' && !isSalesRep) {
            return res.json({
                success: true,
                role: 'Admin',
                isSalesRep: false,
                store: null,
                username: req.user.username
            });
        }

        res.json({
            success: true,
            role: req.user.role,
            isSalesRep,
            store: isSalesRep ? salesRep[0].store : null,
            username: req.user.username
        });

    } catch (error) {
        console.error('Role check error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error checking user role',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;