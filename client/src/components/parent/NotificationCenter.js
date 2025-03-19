import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Menu,
  MenuItem,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as DeleteOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  EventNote as EventNoteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useParentNotifications } from '../../contexts/ParentNotificationContext';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    formatNotificationDate
  } = useParentNotifications();

  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for action menu on individual notifications
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Handle opening the notification center
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle closing the notification center
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle opening the action menu for a notification
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  // Handle closing the action menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (event, notificationId) => {
    event.stopPropagation();
    await markAsRead(notificationId);
    handleMenuClose();
  };
  
  // Handle deleting a notification
  const handleDeleteNotification = async (event, notificationId) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
    handleMenuClose();
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };
  
  // Handle clearing all notifications
  const handleClearAllNotifications = async () => {
    await clearAllNotifications();
  };
  
  // Handle clicking a notification
  const handleNotificationClick = (notification) => {
    // Mark notification as read if it's not already
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
      handleClose();
    }
  };
  
  // Get icon based on notification category
  const getNotificationIcon = (category) => {
    switch (category) {
      case 'request':
        return <AssignmentIcon />;
      case 'school':
        return <SchoolIcon />;
      case 'event':
        return <EventNoteIcon />;
      case 'success':
        return <CheckCircleOutlineIcon color="success" />;
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      default:
        return <InfoIcon />;
    }
  };
  
  // Filter notifications based on selected tab
  const getFilteredNotifications = () => {
    switch (tabValue) {
      case 0: // All
        return notifications;
      case 1: // Unread
        return notifications.filter(notification => !notification.read);
      case 2: // Requests
        return notifications.filter(notification => notification.category === 'request');
      case 3: // School
        return notifications.filter(notification => notification.category === 'school' || notification.category === 'event');
      default:
        return notifications;
    }
  };
  
  // Render notification list
  const renderNotifications = () => {
    const filteredNotifications = getFilteredNotifications();
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 36, mb: 1 }} />
          <Typography variant="body2" color="error">
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      );
    }
    
    if (filteredNotifications.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 
              ? 'No notifications yet.' 
              : tabValue === 1 
                ? 'No unread notifications.' 
                : 'No notifications in this category.'}
          </Typography>
        </Box>
      );
    }
    
    return (
      <List sx={{ width: '100%', p: 0 }}>
        {filteredNotifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem 
              alignItems="flex-start" 
              sx={{
                bgcolor: notification.read ? 'inherit' : 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
                cursor: 'pointer'
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: (notification.category === 'request' || notification.category === 'general') ? 'primary.main' : 'secondary.main' }}>
                  {getNotificationIcon(notification.category)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.title}
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ display: 'block' }}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatNotificationDate(notification.createdAt)}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, notification)}
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < filteredNotifications.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="show notifications"
        aria-controls={open ? 'notification-popover' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id="notification-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ 
          mt: 1,
          '& .MuiPopover-paper': { 
            width: 360, 
            maxHeight: 480 
          } 
        }}
      >
        <Paper elevation={0}>
          <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            <Box>
              <Button 
                size="small" 
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </Button>
              <Button 
                size="small" 
                onClick={handleClearAllNotifications}
                disabled={notifications.length === 0}
              >
                Clear all
              </Button>
            </Box>
          </Box>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All" />
            <Tab label={`Unread (${unreadCount})`} disabled={unreadCount === 0} />
            <Tab label="Requests" />
            <Tab label="School" />
          </Tabs>
          
          <Box sx={{ maxHeight: 360, overflow: 'auto' }}>
            {renderNotifications()}
          </Box>
          
          <Box sx={{ p: 1, textAlign: 'center', borderTop: 1, borderColor: 'divider' }}>
            <Button 
              size="small" 
              onClick={handleClose}
              sx={{ textTransform: 'none' }}
            >
              Close
            </Button>
          </Box>
        </Paper>
      </Popover>
      
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={(e) => handleMarkAsRead(e, selectedNotification.id)}>
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon fontSize="small" />
            </ListItemAvatar>
            <ListItemText primary="Mark as read" />
          </MenuItem>
        )}
        <MenuItem onClick={(e) => selectedNotification && handleDeleteNotification(e, selectedNotification.id)}>
          <ListItemAvatar sx={{ minWidth: 36 }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemAvatar>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter; 