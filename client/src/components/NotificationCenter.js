import React, { useState } from 'react';
import {
  Badge,
  Box,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  Button,
  Chip,
  ListItemButton,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  ImportExport as ImportIcon,
  AutoAwesome as OptimizeIcon,
  ContactMail as RequestIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

// Component to get the appropriate icon for each notification type
const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'studentImport':
      return <ImportIcon color="primary" />;
    case 'classOptimization':
      return <OptimizeIcon color="success" />;
    case 'parentRequest':
      return <RequestIcon color="info" />;
    case 'teacherSurvey':
      return <SchoolIcon color="secondary" />;
    case 'system':
      return <InfoIcon color="action" />;
    default:
      return <NotificationsIcon color="disabled" />;
  }
};

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
    fetchNotifications,
  } = useNotifications();
  
  // State for popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  
  // State for actions menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'studentImport':
        navigate('/student-import');
        break;
      case 'classOptimization':
        navigate('/class-lists');
        break;
      case 'parentRequest':
        navigate('/parent-requests');
        break;
      case 'teacherSurvey':
        navigate('/teacher-surveys');
        break;
      default:
        break;
    }
    
    setAnchorEl(null);
  };
  
  // Handle icon click to open popover
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when opened
  };
  
  // Handle close popover
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle mark all as read
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notification) => {
    await deleteNotification(notification.id);
    setMenuAnchorEl(null);
  };
  
  // Handle menu open
  const handleMenuOpen = (event, notification) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNotification(null);
  };
  
  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label="notifications"
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon />
          ) : (
            <NotificationsIcon />
          )}
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
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
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500,
            overflowY: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <Button size="small" onClick={handleMarkAllRead}>
                Mark all read
              </Button>
            </Tooltip>
          )}
        </Box>
        <Divider />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
            <Typography color="textSecondary">No notifications yet</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                disablePadding
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                }}
              >
                <ListItemButton onClick={() => handleNotificationClick(notification)}>
                  <ListItemIcon>
                    <NotificationIcon type={notification.type} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body1" 
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ pr: 4 }}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block" noWrap>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, notification)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        
        <Divider />
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            size="small" 
            startIcon={<SettingsIcon />}
            onClick={() => {
              navigate('/settings');
              handleClose();
            }}
          >
            Notification Settings
          </Button>
          <Chip
            label={`${notifications.length} total`}
            size="small"
            variant="outlined"
          />
        </Box>
      </Popover>
      
      {/* Action menu for individual notifications */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.read && (
          <MenuItem onClick={() => {
            markAsRead(selectedNotification.id);
            handleMenuClose();
          }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          handleDeleteNotification(selectedNotification);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationCenter; 