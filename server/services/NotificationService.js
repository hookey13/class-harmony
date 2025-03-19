const nodemailer = require('nodemailer');
const webpush = require('web-push');
const twilio = require('twilio');
const Notification = require('../models/Notification');
const User = require('../models/User');
const config = require('../config');

class NotificationService {
  constructor() {
    // Initialize email transport
    this.emailTransport = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });

    // Initialize web push
    webpush.setVapidDetails(
      'mailto:' + config.webpush.email,
      config.webpush.publicKey,
      config.webpush.privateKey
    );

    // Initialize SMS client
    this.smsClient = twilio(
      config.twilio.accountSid,
      config.twilio.authToken
    );
  }

  /**
   * Send a notification through all specified channels
   * @param {Object} notification - Notification document
   * @returns {Promise} - Resolution of all delivery attempts
   */
  async sendNotification(notification) {
    try {
      const user = await User.findById(notification.recipientId)
        .select('email pushSubscription phone notificationPreferences');

      if (!user) {
        throw new Error('Recipient not found');
      }

      const deliveryPromises = notification.channels.map(channel => {
        // Check user's notification preferences
        if (!user.notificationPreferences[channel]) {
          return Promise.resolve({ channel, status: 'skipped' });
        }

        switch (channel) {
          case 'email':
            return this.sendEmail(user.email, notification);
          case 'push':
            return this.sendPushNotification(user.pushSubscription, notification);
          case 'sms':
            return this.sendSMS(user.phone, notification);
          case 'inApp':
            return this.saveInAppNotification(notification);
          default:
            return Promise.resolve({ channel, status: 'unsupported' });
        }
      });

      const results = await Promise.allSettled(deliveryPromises);
      
      // Update notification status based on delivery results
      const allSuccessful = results.every(result => 
        result.status === 'fulfilled' && result.value.status === 'success'
      );

      notification.status = allSuccessful ? 'sent' : 'failed';
      await notification.save();

      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      notification.status = 'failed';
      await notification.save();
      throw error;
    }
  }

  /**
   * Send an email notification
   * @param {string} email - Recipient email
   * @param {Object} notification - Notification document
   * @returns {Promise} - Email sending result
   */
  async sendEmail(email, notification) {
    try {
      const emailTemplate = this.getEmailTemplate(notification);
      
      await this.emailTransport.sendMail({
        from: config.email.from,
        to: email,
        subject: notification.title,
        html: emailTemplate
      });

      return { channel: 'email', status: 'success' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { channel: 'email', status: 'failed', error: error.message };
    }
  }

  /**
   * Send a push notification
   * @param {Object} subscription - Push subscription details
   * @param {Object} notification - Notification document
   * @returns {Promise} - Push notification result
   */
  async sendPushNotification(subscription, notification) {
    try {
      if (!subscription) {
        return { channel: 'push', status: 'skipped', reason: 'no subscription' };
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/icon.png',
        badge: '/badge.png',
        data: {
          notificationId: notification._id,
          type: notification.type,
          metadata: notification.metadata
        }
      });

      await webpush.sendNotification(subscription, payload);
      return { channel: 'push', status: 'success' };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { channel: 'push', status: 'failed', error: error.message };
    }
  }

  /**
   * Send an SMS notification
   * @param {string} phone - Recipient phone number
   * @param {Object} notification - Notification document
   * @returns {Promise} - SMS sending result
   */
  async sendSMS(phone, notification) {
    try {
      if (!phone) {
        return { channel: 'sms', status: 'skipped', reason: 'no phone number' };
      }

      await this.smsClient.messages.create({
        body: `${notification.title}\n\n${notification.message}`,
        from: config.twilio.phoneNumber,
        to: phone
      });

      return { channel: 'sms', status: 'success' };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { channel: 'sms', status: 'failed', error: error.message };
    }
  }

  /**
   * Save an in-app notification
   * @param {Object} notification - Notification document
   * @returns {Promise} - Save result
   */
  async saveInAppNotification(notification) {
    try {
      await notification.save();
      return { channel: 'inApp', status: 'success' };
    } catch (error) {
      console.error('Error saving in-app notification:', error);
      return { channel: 'inApp', status: 'failed', error: error.message };
    }
  }

  /**
   * Get HTML template for email notification
   * @param {Object} notification - Notification document
   * @returns {string} - HTML template
   */
  getEmailTemplate(notification) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4a90e2;
              color: white;
              padding: 20px;
              text-align: center;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4a90e2;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${notification.title}</h2>
            </div>
            <div class="content">
              <p>${notification.message}</p>
              ${this.getActionButton(notification)}
            </div>
            <div class="footer">
              <p>This is an automated message from Class Harmony. Please do not reply to this email.</p>
              <p>If you have any questions, please contact your school administrator.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get action button HTML for email template
   * @param {Object} notification - Notification document
   * @returns {string} - Button HTML or empty string
   */
  getActionButton(notification) {
    if (!notification.metadata.actionRequired) {
      return '';
    }

    const actionUrl = this.getActionUrl(notification);
    return `
      <a href="${actionUrl}" class="button">
        ${this.getActionText(notification)}
      </a>
    `;
  }

  /**
   * Get action URL for notification
   * @param {Object} notification - Notification document
   * @returns {string} - Action URL
   */
  getActionUrl(notification) {
    const baseUrl = config.appUrl;
    switch (notification.metadata.actionType) {
      case 'UPLOAD_DOCUMENT':
        return `${baseUrl}/parent/documents/upload/${notification.metadata.studentId}`;
      case 'VIEW_PLACEMENT':
        return `${baseUrl}/parent/placement/${notification.metadata.studentId}`;
      case 'UPDATE_PREFERENCES':
        return `${baseUrl}/parent/preferences/${notification.metadata.studentId}`;
      default:
        return baseUrl;
    }
  }

  /**
   * Get action button text
   * @param {Object} notification - Notification document
   * @returns {string} - Action text
   */
  getActionText(notification) {
    switch (notification.metadata.actionType) {
      case 'UPLOAD_DOCUMENT':
        return 'Upload Document';
      case 'VIEW_PLACEMENT':
        return 'View Placement';
      case 'UPDATE_PREFERENCES':
        return 'Update Preferences';
      default:
        return 'View Details';
    }
  }

  /**
   * Schedule a notification for future delivery
   * @param {Object} notification - Notification document
   * @param {Date} scheduledDate - Date to send notification
   * @returns {Promise} - Scheduled job
   */
  async scheduleNotification(notification, scheduledDate) {
    // Implementation would depend on your job scheduling system
    // (e.g., bull, agenda, etc.)
    // This is a placeholder for the scheduling logic
    return {
      notification,
      scheduledDate,
      status: 'scheduled'
    };
  }

  /**
   * Send batch notifications
   * @param {Array} notifications - Array of notification documents
   * @returns {Promise} - Batch sending results
   */
  async sendBatchNotifications(notifications) {
    return Promise.all(
      notifications.map(notification => this.sendNotification(notification))
    );
  }
}

module.exports = new NotificationService(); 