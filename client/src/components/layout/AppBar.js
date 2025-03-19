import React, { useEffect, useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationBell from '../NotificationBell';

const AppBar = ({ onDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { subscribeToPushNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);

  useEffect(() => {
    // Check if we need to request notification permissions
    if (
      'Notification' in window &&
      Notification.permission === 'default' &&
      user?.notificationPreferences?.push
    ) {
      setShowPermissionAlert(true);
    }
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await subscribeToPushNotifications();
        setShowPermissionAlert(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  return (
    <>
      <MuiAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Class Harmony
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationBell />
              
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user.avatar ? (
                  <Avatar
                    alt={`${user.firstName} ${user.lastName}`}
                    src={user.avatar}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleClose}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </MuiAppBar>

      <Snackbar
        open={showPermissionAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setShowPermissionAlert(false)}
      >
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleEnableNotifications}>
              Enable
            </Button>
          }
        >
          Enable notifications to stay updated about class changes and parent requests
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppBar; 