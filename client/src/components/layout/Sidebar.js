import React from 'react';
import { 
  Drawer, 
  List, 
  Divider, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Box 
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  Settings as SettingsIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Define menu items based on user role
  const getMenuItems = () => {
    // Default items for all users
    const items = [];
    
    // Admin items
    if (currentUser && currentUser.role === 'admin') {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Users', icon: <PersonIcon />, path: '/admin/users' },
        { text: 'Placement Requests', icon: <AssignmentIcon />, path: '/admin/placement-requests' },
        { text: 'Class Management', icon: <GroupIcon />, path: '/admin/classes' },
        { text: 'School Settings', icon: <SchoolIcon />, path: '/admin/settings' }
      );
    }
    
    // Teacher items
    else if (currentUser && currentUser.role === 'teacher') {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/teacher/dashboard' },
        { text: 'My Students', icon: <PersonIcon />, path: '/teacher/students' },
        { text: 'Student Surveys', icon: <AssignmentIcon />, path: '/teacher/surveys' },
        { text: 'Collaboration', icon: <GroupIcon />, path: '/teacher/collaboration' },
        { text: 'School Info', icon: <SchoolIcon />, path: '/teacher/school-info' }
      );
    }
    
    // Parent items
    else if (currentUser && currentUser.role === 'parent') {
      items.push(
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/parent/dashboard' },
        { text: 'My Children', icon: <PersonIcon />, path: '/parent/children' },
        { text: 'Placement Requests', icon: <AssignmentIcon />, path: '/parent/placement-requests' },
        { text: 'School Info', icon: <SchoolIcon />, path: '/parent/school-info' }
      );
    }
    
    return items;
  };
  
  const menuItems = getMenuItems();
  
  // Support items at the bottom of sidebar
  const supportItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' }
  ];
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        display: { xs: 'none', sm: 'block' }
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {supportItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 