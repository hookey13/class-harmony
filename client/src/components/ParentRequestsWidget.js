import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Badge,
  CircularProgress,
  Button,
  Tab,
  Tabs,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Person as PersonIcon,
  CheckCircle as ApprovedIcon,
  Cancel as DeniedIcon,
  HourglassFull as PendingIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Status definitions with colors
const STATUS = {
  PENDING: {
    label: 'Pending',
    color: 'warning',
    icon: <PendingIcon />
  },
  APPROVED: {
    label: 'Approved',
    color: 'success',
    icon: <ApprovedIcon />
  },
  DENIED: {
    label: 'Denied',
    color: 'error',
    icon: <DeniedIcon />
  }
};

const ParentRequestsWidget = ({ 
  data = null, 
  isLoading = false,
  onRefresh = () => {},
  onViewAll = () => {},
  title = "Parent Requests" 
}) => {
  const [tab, setTab] = useState(0);
  
  // Generate sample data if none provided
  const requests = data || generateSampleRequests();
  
  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };
  
  // Filter requests based on selected tab
  const filteredRequests = tab === 0 
    ? requests 
    : tab === 1 
      ? requests.filter(req => req.status === 'PENDING')
      : tab === 2 
        ? requests.filter(req => req.status === 'APPROVED')
        : requests.filter(req => req.status === 'DENIED');
  
  // Calculate counts for badges
  const pendingCount = requests.filter(req => req.status === 'PENDING').length;
  const approvedCount = requests.filter(req => req.status === 'APPROVED').length;
  const deniedCount = requests.filter(req => req.status === 'DENIED').length;

  return (
    <Card>
      <CardHeader 
        title={title} 
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Refresh requests">
              <IconButton size="small" onClick={onRefresh} disabled={isLoading}>
                {isLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">All</Typography>
                <Chip 
                  size="small" 
                  label={requests.length} 
                  sx={{ ml: 1, minWidth: 28 }} 
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Pending</Typography>
                <Badge badgeContent={pendingCount} color="warning" sx={{ ml: 1 }}>
                  <Box />
                </Badge>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Approved</Typography>
                <Badge badgeContent={approvedCount} color="success" sx={{ ml: 1 }}>
                  <Box />
                </Badge>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Denied</Typography>
                <Badge badgeContent={deniedCount} color="error" sx={{ ml: 1 }}>
                  <Box />
                </Badge>
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      <CardContent sx={{ px: 0, pb: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No requests found</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredRequests.slice(0, 5).map((request) => (
              <React.Fragment key={request.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" component="span">
                          {request.studentName}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={STATUS[request.status].label}
                          color={STATUS[request.status].color}
                          icon={STATUS[request.status].icon}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span" color="text.primary">
                          {request.reason}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          From: {request.parentName} • {request.date} • Grade {request.grade}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 1.5 }}>
        <Button 
          size="small" 
          onClick={onViewAll}
          disabled={filteredRequests.length === 0}
        >
          View All Requests
        </Button>
      </Box>
    </Card>
  );
};

// Helper function to generate sample data
function generateSampleRequests() {
  const students = [
    'Emma Thompson', 'Liam Johnson', 'Olivia Wilson', 'Noah Davis', 
    'Ava Miller', 'Mason Smith', 'Sophia Brown', 'Jacob Garcia',
    'Isabella Jones', 'William Martinez'
  ];
  
  const parents = [
    'Sarah Thompson', 'David Johnson', 'Jennifer Wilson', 'Michael Davis', 
    'Emily Miller', 'Christopher Smith', 'Jessica Brown', 'Daniel Garcia',
    'Amanda Jones', 'Robert Martinez'
  ];
  
  const reasons = [
    'Prefers to be with friend Maya Chen',
    'Would benefit from being in Ms. Johnson\'s class',
    'Needs to be separate from Jackson Smith (conflict)',
    'Works well with Ms. Peterson\'s teaching style',
    'Requesting placement with a specific teacher',
    'Has a conflict with another student',
    'Would benefit from a structured classroom environment',
    'Requesting placement with sibling',
    'Learning style matches better with Mr. Davis',
    'Needs to be in a class with strong math focus'
  ];
  
  const statuses = ['PENDING', 'APPROVED', 'DENIED', 'PENDING', 'PENDING'];
  
  const dates = [
    '3 days ago', '1 week ago', '2 weeks ago', 'Yesterday', 'Today',
    '4 days ago', '5 days ago', '1 day ago', '2 days ago', '3 weeks ago'
  ];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    studentName: students[i],
    parentName: parents[i],
    reason: reasons[i],
    status: statuses[i % statuses.length],
    date: dates[i],
    grade: 1 + Math.floor(Math.random() * 5)
  }));
}

export default ParentRequestsWidget; 