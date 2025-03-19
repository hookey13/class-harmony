const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const NotificationService = require('../services/NotificationService');

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    const query = {
      recipientId: req.user.id
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('metadata.studentId', 'firstName lastName')
        .populate('metadata.classId', 'name roomNumber')
        .populate('metadata.teacherId', 'firstName lastName'),
      Notification.countDocuments(query)
    ]);

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notifications count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.id,
      status: { $in: ['pending', 'sent', 'delivered'] }
    });

    res.json({ count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get notifications requiring action
router.get('/pending-actions', auth, async (req, res) => {
  try {
    const notifications = await Notification.getPendingActionNotifications(req.user.id);
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching pending actions:', err);
    res.status(500).json({ error: 'Failed to fetch pending actions' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientId: req.user.id,
        status: { $in: ['pending', 'sent', 'delivered'] }
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.remove();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Update notification preferences
router.put('/preferences', [
  auth,
  body('email').isBoolean(),
  body('push').isBoolean(),
  body('sms').isBoolean(),
  body('inApp').isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        notificationPreferences: {
          email: req.body.email,
          push: req.body.push,
          sms: req.body.sms,
          inApp: req.body.inApp
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      preferences: user.notificationPreferences
    });
  } catch (err) {
    console.error('Error updating notification preferences:', err);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

// Subscribe to push notifications
router.post('/push-subscription', [
  auth,
  body('subscription').isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    await User.findByIdAndUpdate(req.user.id, {
      pushSubscription: req.body.subscription
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ error: 'Failed to save push subscription' });
  }
});

// Test notification (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test', auth, async (req, res) => {
    try {
      const notification = await Notification.create({
        recipientId: req.user.id,
        type: 'SYSTEM_UPDATE',
        title: 'Test Notification',
        message: 'This is a test notification.',
        priority: 'low',
        channels: ['email', 'inApp']
      });

      const results = await NotificationService.sendNotification(notification);
      res.json({ success: true, results });
    } catch (err) {
      console.error('Error sending test notification:', err);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  });
}

module.exports = router; 