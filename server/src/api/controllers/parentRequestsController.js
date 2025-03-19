const ParentRequest = require('../models/ParentRequest');
const Student = require('../models/Student');
const ParentUser = require('../models/ParentUser');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all parent requests for the logged-in parent
// @route   GET /api/parent/requests
// @access  Private (parent only)
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  // Get all requests for the logged-in parent
  const requests = await ParentRequest.find({ parent: req.user.id })
    .populate('student', 'firstName lastName grade')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get single parent request
// @route   GET /api/parent/requests/:id
// @access  Private (parent only)
exports.getRequest = asyncHandler(async (req, res, next) => {
  const request = await ParentRequest.findById(req.params.id)
    .populate('student', 'firstName lastName grade')
    .populate('parent', 'firstName lastName email');

  // Check if request exists
  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
  }

  // Make sure parent is viewing their own request
  if (request.parent.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to access this request`, 401));
  }

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Create new parent request
// @route   POST /api/parent/requests
// @access  Private (parent only)
exports.createRequest = asyncHandler(async (req, res, next) => {
  // Add parent to req.body
  req.body.parent = req.user.id;
  
  const { student: studentId, requestType, requestDetails, preferredTeacher, avoidStudent } = req.body;

  // Check if student belongs to parent
  const student = await Student.findById(studentId);
  
  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${studentId}`, 404));
  }
  
  // Check if parent is authorized for this student
  const parentUser = await ParentUser.findById(req.user.id);
  if (!parentUser.students.includes(studentId)) {
    return next(new ErrorResponse(`Parent not authorized for this student`, 401));
  }

  // Check if there's an existing active request for this student
  const existingRequest = await ParentRequest.findOne({
    student: studentId,
    status: { $in: ['pending', 'under_review'] }
  });

  if (existingRequest) {
    return next(new ErrorResponse(`An active request already exists for this student`, 400));
  }

  // Create request
  const request = await ParentRequest.create({
    parent: req.user.id,
    student: studentId,
    school: student.school,
    requestType,
    requestDetails,
    preferredTeacher,
    avoidStudent,
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Update parent request
// @route   PUT /api/parent/requests/:id
// @access  Private (parent only)
exports.updateRequest = asyncHandler(async (req, res, next) => {
  let request = await ParentRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
  }

  // Make sure parent owns the request
  if (request.parent.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this request`, 401));
  }

  // Only allow updates if the request is pending
  if (request.status !== 'pending') {
    return next(new ErrorResponse(`Cannot update request that is ${request.status}`, 400));
  }

  // Update fields
  const fieldsToUpdate = {
    requestType: req.body.requestType,
    requestDetails: req.body.requestDetails,
    preferredTeacher: req.body.preferredTeacher,
    avoidStudent: req.body.avoidStudent
  };

  request = await ParentRequest.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: request
  });
});

// @desc    Delete parent request
// @route   DELETE /api/parent/requests/:id
// @access  Private (parent only)
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const request = await ParentRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
  }

  // Make sure parent owns the request
  if (request.parent.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this request`, 401));
  }

  // Only allow deletion if the request is pending
  if (request.status !== 'pending') {
    return next(new ErrorResponse(`Cannot delete request that is ${request.status}`, 400));
  }

  await request.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 