import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Button,
  Paper,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../contexts/NotificationContext';

// Get appropriate icon for notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    case 'system':
      return <InfoIcon color="primary" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const NotificationsMenu = ({ open, anchorEl, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotifications();

  // Fetch notifications when opened
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        elevation: 3,
        sx: {
          width: '350px',
          maxHeight: '500px',
          overflowY: 'auto',
        }
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button 
            size="small"
            variant="outlined" 
            color="inherit" 
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllAsRead}
          >
            Mark all read
          </Button>
        )}
      </Box>
      
      <Divider />
      
      <List>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1, pt: 0.5 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" component="div">
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" component="div" color="textPrimary">
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(notification.date), 'MMM d, yyyy h:mm a')}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          {!notification.read && (
                            <Chip 
                              label="New" 
                              size="small" 
                              color="primary" 
                              sx={{ mr: 0.5, height: 20, '& .MuiChip-label': { px: 1 } }} 
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                  {!notification.read && (
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <MarkReadIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete notification"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
      
      {notifications.length > 0 && (
        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="text" 
            size="small" 
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationsMenu; 