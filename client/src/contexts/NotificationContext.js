import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

const actionTypes = {
  FETCH_NOTIFICATIONS_START: 'FETCH_NOTIFICATIONS_START',
  FETCH_NOTIFICATIONS_SUCCESS: 'FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_ERROR: 'FETCH_NOTIFICATIONS_ERROR',
  UPDATE_UNREAD_COUNT: 'UPDATE_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_READ: 'MARK_ALL_READ',
  DELETE_NOTIFICATION: 'DELETE_NOTIFICATION',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION'
};

function notificationReducer(state, action) {
  switch (action.type) {
    case actionTypes.FETCH_NOTIFICATIONS_START:
      return {
        ...state,
        loading: true,
        error: null
      };
    case actionTypes.FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.notifications,
        pagination: action.payload.pagination,
        error: null
      };
    case actionTypes.FETCH_NOTIFICATIONS_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case actionTypes.UPDATE_UNREAD_COUNT:
      return {
        ...state,
        unreadCount: action.payload
      };
    case actionTypes.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, status: 'read', readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case actionTypes.MARK_ALL_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          status: 'read',
          readAt: new Date()
        })),
        unreadCount: 0
      };
    case actionTypes.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification._id !== action.payload
        ),
        unreadCount: state.unreadCount - (
          state.notifications.find(n => n._id === action.payload)?.status !== 'read' ? 1 : 0
        )
      };
    case actionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;

    dispatch({ type: actionTypes.FETCH_NOTIFICATIONS_START });
    try {
      const response = await axios.get(`/api/notifications?page=${page}`);
      dispatch({
        type: actionTypes.FETCH_NOTIFICATIONS_SUCCESS,
        payload: response.data
      });
    } catch (error) {
      dispatch({
        type: actionTypes.FETCH_NOTIFICATIONS_ERROR,
        payload: error.response?.data?.error || 'Failed to fetch notifications'
      });
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.get('/api/notifications/unread/count');
      dispatch({
        type: actionTypes.UPDATE_UNREAD_COUNT,
        payload: response.data.count
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      dispatch({ type: actionTypes.MARK_AS_READ, payload: notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      dispatch({ type: actionTypes.MARK_ALL_READ });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      dispatch({ type: actionTypes.DELETE_NOTIFICATION, payload: notificationId });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateNotificationPreferences = async (preferences) => {
    try {
      const response = await axios.put('/api/notifications/preferences', preferences);
      return response.data.preferences;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
      });

      await axios.post('/api/notifications/push-subscription', {
        subscription: subscription.toJSON()
      });

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  // Poll for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    fetchUnreadCount();

    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const value = {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateNotificationPreferences,
    subscribeToPushNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext; 