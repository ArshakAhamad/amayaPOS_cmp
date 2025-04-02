import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import pool from './config/db.js';

// Import routes
import loginRoutes from './routes/loginRoute.js';
import salesRepRoutes from './routes/salesRepRoute.js';
import profileRoutes from './routes/profileRoute.js';
import voucherRoutes from './routes/voucherRoute.js';
import customerRoutes from './routes/customerRoute.js';
import productRoutes from './routes/productRoute.js';
import categoryRoutes from './routes/categoryRoute.js';
import SupplierRoutes from './routes/SupplierRoute.js';
import StoreRoutes from './routes/storeRoute.js';
import storeTypeRoutes from './routes/storeTypeRoute.js';
import POSRoutes from './routes/POSRoute.js';
import purchaseRoutes from './routes/purchaseRoute.js';
import productReturnRoutes from './routes/productReturnRoute.js';
import productMovementRoutes from './routes/productMovementRoute.js';
import profitLossRoutes from './routes/profitLossRoutes.js';
import cashRoutes from './routes/cashRoute.js';
import salesProfitRoutes from './routes/salesProfitRoute.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import purchaseBillsRoutes from './routes/purchaseBillsRoute.js';
import authRoutes from './routes/authRoute.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins (add your frontend URL)
const allowedOrigins = [
  'http://localhost:5173', // Vite frontend
  'https://amaya-pos.netlify.app', // Production frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/', loginRoutes);
app.use('/api/', salesRepRoutes);
app.use('/api/', profileRoutes);
app.use('/api/', voucherRoutes);
app.use('/api/', customerRoutes);
app.use('/api/', productRoutes);
app.use('/api/', categoryRoutes);
app.use('/api/', SupplierRoutes);
app.use('/api/', StoreRoutes);
app.use('/api', storeTypeRoutes);
app.use('/api/', POSRoutes);
app.use('/api/', purchaseRoutes);
app.use('/api/product_returns', productReturnRoutes);
app.use('/api/productMovement', productMovementRoutes);
app.use('/api/profitLoss', profitLossRoutes);
app.use('/api/sales', salesProfitRoutes);
app.use('/api/cashiers', cashRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchase-bills', purchaseBillsRoutes);

// Catch unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Role-based middleware
const checkRole = (role) => (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Example of a protected route for Admin
app.get('/api/admin/dashboard', checkRole('Admin'), (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

// Example of a protected route for Cashier
app.get('/api/cashier/dashboard', checkRole('Cashier'), (req, res) => {
  res.json({ message: 'Welcome to the Cashier Dashboard' });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});
