const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const classListController = require('../controllers/classListController');
const dashboardRoutes = require('./dashboardRoutes');
const parentAuthRoutes = require('./parentAuthRoutes');
const parentRequestsRoutes = require('./parentRequestsRoutes');
const { authenticate } = require('../middleware/auth');

// Auth routes
router.use('/auth', authRoutes);

// Parent portal routes
router.use('/parent/auth', parentAuthRoutes);

// Protected routes
router.use(authenticate);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

// Class List routes
router.post('/class-lists/:id/optimize', classListController.optimizeClassList);

// Parent request routes (already protected in their router)
router.use('/parent/requests', parentRequestsRoutes);

module.exports = router; 