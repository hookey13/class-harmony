import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Box,
  Divider,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Forum as ForumIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const TeacherSidebar = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [openSubMenu, setOpenSubMenu] = useState('');

  const handleSubMenuToggle = (menu) => {
    setOpenSubMenu(openSubMenu === menu ? '' : menu);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      toggleDrawer(false);
    }
  };

  const isActive = (path) => {
    if (path === '/teacher/dashboard' && location.pathname === '/teacher/dashboard') {
      return true;
    }
    if (path !== '/teacher/dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  const navItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/teacher/dashboard'
    },
    {
      label: 'My Students',
      icon: <GroupIcon />,
      path: '/teacher/students'
    },
    {
      label: 'Classes',
      icon: <SchoolIcon />,
      path: '/teacher/classes'
    },
    {
      label: 'Learning Plans',
      icon: <AssignmentIcon />,
      path: '/teacher/learning-plans',
      subItems: [
        {
          label: 'All Plans',
          path: '/teacher/learning-plans'
        },
        {
          label: 'Create New Plan',
          path: '/teacher/learning-plans/create'
        }
      ]
    },
    {
      label: 'Surveys',
      icon: <MenuBookIcon />,
      path: '/teacher/surveys'
    },
    {
      label: 'Reports',
      icon: <AssessmentIcon />,
      path: '/teacher/reports'
    },
    {
      label: 'Collaboration',
      icon: <ForumIcon />,
      path: '/teacher/collaboration'
    },
    {
      label: 'School Info',
      icon: <InfoIcon />,
      path: '/teacher/school-info'
    }
  ];

  const drawerWidth = 240;

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2
        }}
      >
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main'
          }}
        >
          Class Harmony
        </Typography>
        {isMobile && (
          <IconButton onClick={() => toggleDrawer(false)}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar 
          src={user?.avatar} 
          alt={user?.name} 
          sx={{ 
            width: 40, 
            height: 40,
            mr: 2
          }}
        />
        <Box>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'medium' }}>
            {user?.name || 'Teacher'}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Teacher
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ flexGrow: 1, p: 1 }}>
        {navItems.map((item) => (
          <React.Fragment key={item.label}>
            <ListItem 
              button 
              onClick={() => item.subItems ? handleSubMenuToggle(item.label) : handleNavigation(item.path)}
              sx={{ 
                mb: 0.5, 
                borderRadius: 1,
                bgcolor: isActive(item.path) ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <Tooltip title={item.label} placement="right">
                <ListItemIcon sx={{ minWidth: 40, color: isActive(item.path) ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
              </Tooltip>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: isActive(item.path) ? 'medium' : 'regular',
                  color: isActive(item.path) ? 'primary.main' : 'inherit'
                }}
              />
              {item.subItems && (
                openSubMenu === item.label ? <ExpandLessIcon /> : <ExpandMoreIcon />
              )}
            </ListItem>
            
            {item.subItems && (
              <Collapse in={openSubMenu === item.label} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems.map((subItem) => (
                    <ListItem
                      key={subItem.label}
                      button
                      onClick={() => handleNavigation(subItem.path)}
                      sx={{ 
                        pl: 4, 
                        mb: 0.5, 
                        borderRadius: 1,
                        bgcolor: location.pathname === subItem.path ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                    >
                      <ListItemText
                        primary={subItem.label}
                        primaryTypographyProps={{ 
                          fontSize: '0.875rem',
                          fontWeight: location.pathname === subItem.path ? 'medium' : 'regular',
                          color: location.pathname === subItem.path ? 'primary.main' : 'inherit'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem 
          button 
          onClick={() => handleNavigation('/teacher/settings')}
          sx={{ 
            borderRadius: 1,
            bgcolor: location.pathname === '/teacher/settings' ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => handleNavigation('/teacher/profile')}
          sx={{ 
            borderRadius: 1,
            bgcolor: location.pathname === '/teacher/profile' ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        
        <ListItem 
          button 
          onClick={logout}
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? open : true}
      onClose={() => toggleDrawer(false)}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          boxShadow: 1
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default TeacherSidebar; 