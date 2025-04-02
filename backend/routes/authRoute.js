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
// Standardized response format
const createResponse = (success, data = {}, error = null) => {
    return {
      meta: {
        success: Boolean(success),
        timestamp: new Date().toISOString(),
        code: success ? 'S1000' : (error?.code || 'E1000')
      },
      data: success ? {
        role: data.role,
        isSalesRep: Boolean(data.isSalesRep),
        store: data.store || null,
        username: data.username
      } : null,
      error: !success ? {
        message: error?.message || 'An error occurred',
        details: process.env.NODE_ENV === 'development' ? error?.details : undefined
      } : null
    };
  };
  
  router.get('/check-role', authenticateUser, async (req, res) => {
    try {
      // 1. Get user from database
      const [users] = await pool.execute(
        `SELECT role FROM system_user 
         WHERE id = ? AND status = 'Active'`,
        [req.user.id]
      );
  
      if (users.length === 0) {
        return res.status(403).json(createResponse(false, null, {
          code: 'E1001',
          message: 'User not found or inactive'
        }));
      }
  
      const user = users[0];
      const responseData = {
        role: user.role,
        username: req.user.username,
        isSalesRep: user.role === 'Cashier'
      };
  
      // 2. Additional check for Admins
      if (user.role === 'Admin') {
        const [salesReps] = await pool.execute(
          `SELECT store FROM sales_rep 
           WHERE user_name = ? AND status = 'Active' 
           LIMIT 1`,
          [req.user.username]
        );
        responseData.isSalesRep = salesReps.length > 0;
        responseData.store = responseData.isSalesRep ? salesReps[0].store : null;
      }
  
      // 3. Send standardized success response
      return res.status(200).json(createResponse(true, responseData));
  
    } catch (error) {
      console.error('[AUTH] Role check error:', error);
      return res.status(500).json(createResponse(false, null, {
        code: 'E5000',
        message: 'Internal server error',
        details: error.message
      }));
    }
  });
  
// Response validation function
function validateResponse(response) {
    const requiredFields = ['success', 'role', 'isSalesRep'];
    return requiredFields.every(field => field in response) &&
           typeof response.success === 'boolean' &&
           ['Admin', 'Cashier'].includes(response.role) &&
           typeof response.isSalesRep === 'boolean';
}

export default router;