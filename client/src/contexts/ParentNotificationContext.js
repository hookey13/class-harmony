import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useParentAuth } from './ParentAuthContext';

const ParentNotificationContext = createContext();

export const useParentNotifications = () => {
  const context = useContext(ParentNotificationContext);
  if (!context) {
    throw new Error('useParentNotifications must be used within a ParentNotificationProvider');
  }
  return context;
};

export const ParentNotificationProvider = ({ children }) => {
  const { currentParent, isAuthenticated } = useParentAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch notifications when the component mounts and when the parent changes
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated()) return;
      
      try {
        setLoading(true);
        const response = await api.get('/parent/notifications');
        setNotifications(response.data.data || []);
        
        // Calculate unread count
        const unread = response.data.data.filter(notification => !notification.read).length;
        setUnreadCount(unread);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up polling for new notifications (every 2 minutes)
    const intervalId = setInterval(fetchNotifications, 2 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [currentParent, isAuthenticated]);
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/parent/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      return true;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read.');
      return false;
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put('/parent/notifications/read-all');
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read.');
      return false;
    }
  };
  
  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/parent/notifications/${notificationId}`);
      
      // Update local state
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Recalculate unread count
      const unread = updatedNotifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      
      return true;
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification.');
      return false;
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await api.delete('/parent/notifications');
      
      // Update local state
      setNotifications([]);
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setError('Failed to clear all notifications.');
      return false;
    }
  };
  
  // Get notifications by category
  const getNotificationsByCategory = (category) => {
    return notifications.filter(notification => notification.category === category);
  };
  
  // Add a test notification (for development purposes)
  const addTestNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      title: notification.title || 'Test Notification',
      message: notification.message || 'This is a test notification',
      category: notification.category || 'general',
      createdAt: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  // Format the notification date for display
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 7) {
      return date.toLocaleDateString();
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const contextValue = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationsByCategory,
    addTestNotification,
    formatNotificationDate
  };
  
  return (
    <ParentNotificationContext.Provider value={contextValue}>
      {children}
    </ParentNotificationContext.Provider>
  );
};

export default ParentNotificationContext; 