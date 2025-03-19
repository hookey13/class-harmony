import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    pagination,
    fetchNotifications
  } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status !== 'read') {
      await markAsRead(notification._id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'CLASS_PLACEMENT':
        window.location.href = `/classes/${notification.metadata.classId}`;
        break;
      case 'PARENT_REQUEST':
        window.location.href = `/parent-requests/${notification.metadata.requestId}`;
        break;
      case 'TEACHER_SURVEY':
        window.location.href = `/teacher-surveys/${notification.metadata.surveyId}`;
        break;
      case 'SYSTEM_UPDATE':
        // System updates might not need navigation
        break;
      default:
        break;
    }

    handleClose();
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchNotifications(pagination.page + 1);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const renderNotificationContent = (notification) => {
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    
    return (
      <Box>
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: notification.status !== 'read' ? 'bold' : 'normal' }}>
          {notification.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {notification.message}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {timeAgo}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '350px'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    alignItems="flex-start"
                    button
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.status !== 'read' ? 'action.hover' : 'inherit',
                      '&:hover': {
                        bgcolor: 'action.selected'
                      }
                    }}
                  >
                    <ListItemText
                      primary={renderNotificationContent(notification)}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            {pagination.page < pagination.pages && (
              <Box sx={{ p: 1, textAlign: 'center' }}>
                <Button size="small" onClick={handleLoadMore}>
                  Load More
                </Button>
              </Box>
            )}
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell; 