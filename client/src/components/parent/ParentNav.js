import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  School,
  Person,
  Settings,
  List as ListIcon,
  Add,
  Star,
  Info,
  Upgrade,
} from '@mui/icons-material';

const ParentNav = () => {
  const navItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/parent/dashboard'
    },
    {
      text: 'My Students',
      icon: <School />,
      path: '/parent/students'
    },
    {
      text: 'My Requests',
      icon: <ListIcon />,
      path: '/parent/requests'
    },
    {
      text: 'Enhanced Requests',
      icon: <Upgrade />,
      path: '/parent/requests/enhanced'
    },
    {
      text: 'Create Request',
      icon: <Add />,
      path: '/parent/requests/create'
    },
    {
      text: 'School Info',
      icon: <Info />,
      path: '/parent/school-info'
    },
    {
      text: 'Profile',
      icon: <Person />,
      path: '/parent/profile'
    }
  ];

  return (
    <List>
      {navItems.map((item, index) => (
        <React.Fragment key={item.text}>
          <ListItem button component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
          {index < navItems.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default ParentNav; 