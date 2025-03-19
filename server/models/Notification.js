const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'PLACEMENT_COMPLETE',
      'PREFERENCE_CONFIRMED',
      'PREFERENCE_REVIEWED',
      'DOCUMENT_REQUIRED',
      'CLASS_CHANGE',
      'TEACHER_CHANGE',
      'SCHEDULE_CHANGE',
      'SYSTEM_UPDATE',
      'DEADLINE_REMINDER'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    preferenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentPreference'
    },
    actionRequired: Boolean,
    actionType: String,
    actionDeadline: Date,
    additionalData: mongoose.Schema.Types.Mixed
  },
  channels: [{
    type: String,
    enum: ['email', 'inApp', 'push', 'sms'],
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  readAt: Date,
  deliveredAt: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ 'metadata.studentId': 1 });
notificationSchema.index({ 'metadata.classId': 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if action is required and pending
notificationSchema.virtual('isPendingAction').get(function() {
  return this.metadata.actionRequired && 
         this.metadata.actionDeadline > new Date() &&
         this.status !== 'read';
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.status = 'read';
  this.readAt = new Date();
  await this.save();
};

// Method to mark notification as delivered
notificationSchema.methods.markAsDelivered = async function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  await this.save();
};

// Static method to create placement notification
notificationSchema.statics.createPlacementNotification = async function(
  recipientId,
  studentId,
  classId,
  teacherId
) {
  const Student = mongoose.model('Student');
  const Class = mongoose.model('Class');
  const Teacher = mongoose.model('Teacher');

  const [student, classDetails, teacher] = await Promise.all([
    Student.findById(studentId).select('firstName lastName'),
    Class.findById(classId).select('name roomNumber'),
    Teacher.findById(teacherId).select('firstName lastName')
  ]);

  return this.create({
    recipientId,
    type: 'PLACEMENT_COMPLETE',
    title: 'Class Placement Completed',
    message: `${student.firstName} ${student.lastName} has been placed in ${classDetails.name} with ${teacher.firstName} ${teacher.lastName}`,
    priority: 'high',
    metadata: {
      studentId,
      classId,
      teacherId,
      actionRequired: false
    },
    channels: ['email', 'inApp']
  });
};

// Static method to create preference confirmation notification
notificationSchema.statics.createPreferenceConfirmation = async function(
  recipientId,
  studentId,
  preferenceId
) {
  const Student = mongoose.model('Student');
  const student = await Student.findById(studentId).select('firstName lastName');

  return this.create({
    recipientId,
    type: 'PREFERENCE_CONFIRMED',
    title: 'Preferences Submitted Successfully',
    message: `Your preferences for ${student.firstName} ${student.lastName} have been received and will be reviewed.`,
    priority: 'medium',
    metadata: {
      studentId,
      preferenceId,
      actionRequired: false
    },
    channels: ['email', 'inApp']
  });
};

// Static method to create document request notification
notificationSchema.statics.createDocumentRequest = async function(
  recipientId,
  studentId,
  documentType,
  deadline
) {
  const Student = mongoose.model('Student');
  const student = await Student.findById(studentId).select('firstName lastName');

  return this.create({
    recipientId,
    type: 'DOCUMENT_REQUIRED',
    title: 'Document Required',
    message: `Please provide ${documentType} documentation for ${student.firstName} ${student.lastName}`,
    priority: 'high',
    metadata: {
      studentId,
      actionRequired: true,
      actionType: 'UPLOAD_DOCUMENT',
      actionDeadline: deadline,
      additionalData: { documentType }
    },
    channels: ['email', 'inApp', 'sms'],
    expiresAt: deadline
  });
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadNotifications = function(userId) {
  return this.find({
    recipientId: userId,
    status: { $in: ['pending', 'sent', 'delivered'] }
  })
  .sort('-createdAt')
  .populate('metadata.studentId', 'firstName lastName')
  .populate('metadata.classId', 'name roomNumber')
  .populate('metadata.teacherId', 'firstName lastName');
};

// Static method to get pending action notifications
notificationSchema.statics.getPendingActionNotifications = function(userId) {
  return this.find({
    recipientId: userId,
    'metadata.actionRequired': true,
    'metadata.actionDeadline': { $gt: new Date() },
    status: { $ne: 'read' }
  })
  .sort('metadata.actionDeadline')
  .populate('metadata.studentId', 'firstName lastName');
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 