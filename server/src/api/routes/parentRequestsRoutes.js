const express = require('express');
const {
  getMyRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest
} = require('../controllers/parentRequestsController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);
router.use(authorize('parent'));

router
  .route('/')
  .get(getMyRequests)
  .post(createRequest);

router
  .route('/:id')
  .get(getRequest)
  .put(updateRequest)
  .delete(deleteRequest);

module.exports = router; 