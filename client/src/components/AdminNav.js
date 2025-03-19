import React from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Dashboard,
  School,
  People,
  Settings,
  Assignment,
  Upload,
  AutoFixHigh,
  Assessment,
  Link as LinkIcon,
  Timeline,
  ExpandLess,
  ExpandMore,
  BarChart,
  InsertChart,
} from '@mui/icons-material';
import { useState } from 'react';

const AdminNav = () => {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const handleAnalyticsClick = () => {
    setAnalyticsOpen(!analyticsOpen);
  };

  const navItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin/dashboard'
    },
    {
      text: 'Schools',
      icon: <School />,
      path: '/admin/schools'
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/admin/users'
    },
    {
      text: 'Placement Requests',
      icon: <Assignment />,
      path: '/admin/placement-requests'
    },
    {
      text: 'Data Import',
      icon: <Upload />,
      path: '/admin/data-import'
    },
    {
      text: 'Class Optimization',
      icon: <AutoFixHigh />,
      path: '/admin/optimize'
    },
    {
      text: 'Analytics & Reports',
      icon: <Assessment />,
      path: '/admin/analytics'
    },
    {
      text: 'Integrations',
      icon: <LinkIcon />,
      path: '/admin/integrations'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/admin/settings'
    }
  ];

  const analyticsItems = [
    {
      text: 'Standard Analytics',
      icon: <Assessment />,
      path: '/admin/analytics'
    },
    {
      text: 'Multi-Year Analysis',
      icon: <Timeline />,
      path: '/admin/multi-year-analytics'
    },
    {
      text: 'Predictive Analytics',
      icon: <BarChart />,
      path: '/admin/predictive-analytics'
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
          {index < navItems.length - 1 && index !== 5 && <Divider />}
          {index === 5 && (
            <>
              <Divider />
              <ListItem button onClick={handleAnalyticsClick}>
                <ListItemIcon>
                  <InsertChart />
                </ListItemIcon>
                <ListItemText primary="Analytics & Reports" />
                {analyticsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={analyticsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {analyticsItems.map((item) => (
                    <ListItem button component={Link} to={item.path} key={item.text} sx={{ pl: 4 }}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              <Divider />
            </>
          )}
        </React.Fragment>
      ))}
    </List>
  );
};

export default AdminNav; 