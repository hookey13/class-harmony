import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Link,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  School as SchoolIcon,
  Announcement as AnnouncementIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Public as PublicIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useParentAuth } from '../../contexts/ParentAuthContext';
import api from '../../services/api';

// TabPanel component for tab contents
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`school-tabpanel-${index}`}
      aria-labelledby={`school-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SchoolInfo = () => {
  const { currentParent, loading: authLoading } = useParentAuth();
  
  // State for school data
  const [school, setSchool] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch school data
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!currentParent) return;
      
      try {
        setLoading(true);
        
        // If school info is in currentParent, use that first
        if (currentParent.school) {
          setSchool(currentParent.school);
        } else {
          // Otherwise fetch from API
          const schoolResponse = await api.get('/parent/school');
          setSchool(schoolResponse.data.data);
        }
        
        // Fetch announcements
        const announcementsResponse = await api.get('/parent/school/announcements');
        setAnnouncements(announcementsResponse.data.data || []);
        
        // Fetch staff directory
        const staffResponse = await api.get('/parent/school/staff');
        setStaff(staffResponse.data.data || []);
        
        // Fetch academic calendar events
        const eventsResponse = await api.get('/parent/school/events');
        setEvents(eventsResponse.data.data || []);
        
        setError('');
      } catch (err) {
        console.error('Error fetching school data:', err);
        setError('Failed to load school information. Please try again later.');
        
        // For development purposes, let's provide mock data for demonstration
        provideMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchoolData();
  }, [currentParent]);
  
  // Provide mock data for demonstration purposes when API fails
  const provideMockData = () => {
    // Mock school data
    setSchool({
      name: 'Lincoln Elementary School',
      address: '123 Education Lane, Springfield, IL 62701',
      phone: '(555) 123-4567',
      email: 'info@lincolnelementary.edu',
      website: 'www.lincolnelementary.edu',
      principalName: 'Dr. Sarah Johnson',
      description: 'Lincoln Elementary School is committed to providing a nurturing educational environment where students can thrive academically, socially, and emotionally. Our dedicated staff works collaboratively with families to ensure each child reaches their full potential.',
      mission: 'To inspire a lifelong love of learning and empower students to become responsible, compassionate citizens who contribute positively to their communities.',
      vision: 'Creating tomorrow\'s leaders through excellence in education today.',
      yearFounded: 1985,
      grades: 'K-5',
      studentCount: 450,
      logo: 'https://placehold.co/400x150/3f51b5/white?text=Lincoln+Elementary'
    });
    
    // Mock announcements
    setAnnouncements([
      {
        id: 1,
        title: 'Fall Parent-Teacher Conferences',
        content: 'Fall parent-teacher conferences will be held on October 15-16. Sign-up sheets will be available in the main office starting October 1. Please contact your child\'s teacher if you need to schedule outside these dates.',
        date: '2023-09-20T08:00:00.000Z',
        important: true
      },
      {
        id: 2,
        title: 'Annual Fall Festival',
        content: 'Join us for our Annual Fall Festival on Saturday, October 28 from 11AM-3PM. Activities include games, food trucks, pumpkin decorating, and a costume parade. All proceeds benefit the school library.',
        date: '2023-09-18T09:30:00.000Z',
        important: false
      },
      {
        id: 3,
        title: 'School Picture Day',
        content: 'School picture day is scheduled for September 29. Order forms will be sent home with students next week. Please ensure your child comes to school in dress code-approved attire.',
        date: '2023-09-15T10:15:00.000Z',
        important: false
      },
      {
        id: 4,
        title: 'Early Dismissal - Professional Development',
        content: 'There will be an early dismissal at 1:30PM on Friday, October 6 for teacher professional development. After-school programs will run as scheduled.',
        date: '2023-09-10T14:00:00.000Z',
        important: true
      },
      {
        id: 5,
        title: 'New Lunch Menu Released',
        content: 'The October lunch menu is now available on the school website. We\'ve added several new nutritious options based on student feedback from last semester.',
        date: '2023-09-05T11:20:00.000Z',
        important: false
      }
    ]);
    
    // Mock staff directory
    setStaff([
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        position: 'Principal',
        email: 'sjohnson@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 101',
        bio: 'Dr. Johnson has been in education for over 20 years and has been the principal at Lincoln Elementary since 2015.',
        photoUrl: 'https://placehold.co/150/9c27b0/white?text=SJ'
      },
      {
        id: 2,
        name: 'Michael Rodriguez',
        position: 'Assistant Principal',
        email: 'mrodriguez@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 102',
        bio: 'Mr. Rodriguez oversees curriculum development and student discipline.',
        photoUrl: 'https://placehold.co/150/2196f3/white?text=MR'
      },
      {
        id: 3,
        name: 'Jennifer Chen',
        position: 'School Counselor',
        email: 'jchen@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 201',
        bio: 'Ms. Chen provides social-emotional support and guidance to students.',
        photoUrl: 'https://placehold.co/150/4caf50/white?text=JC'
      },
      {
        id: 4,
        name: 'Robert Williams',
        position: 'Physical Education Teacher',
        email: 'rwilliams@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 301',
        bio: 'Coach Williams leads our physical education program and after-school sports.',
        photoUrl: 'https://placehold.co/150/f44336/white?text=RW'
      },
      {
        id: 5,
        name: 'Emily Thompson',
        position: 'School Nurse',
        email: 'ethompson@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 110',
        bio: 'Nurse Thompson manages student health needs and medical records.',
        photoUrl: 'https://placehold.co/150/ff9800/white?text=ET'
      },
      {
        id: 6,
        name: 'David Patterson',
        position: 'Technology Coordinator',
        email: 'dpatterson@lincolnelementary.edu',
        phone: '(555) 123-4567 ext. 401',
        bio: 'Mr. Patterson manages technology infrastructure and digital learning tools.',
        photoUrl: 'https://placehold.co/150/607d8b/white?text=DP'
      }
    ]);
    
    // Mock calendar events
    setEvents([
      {
        id: 1,
        title: 'First Day of School',
        date: '2023-08-28',
        description: 'Welcome back students! School day runs from 8:00 AM - 3:00 PM.',
        location: 'Lincoln Elementary School',
        category: 'academic'
      },
      {
        id: 2,
        title: 'Labor Day - No School',
        date: '2023-09-04',
        description: 'School closed in observance of Labor Day.',
        location: null,
        category: 'holiday'
      },
      {
        id: 3,
        title: 'School Picture Day',
        date: '2023-09-29',
        description: 'Individual and class photos. Order forms will be sent home in advance.',
        location: 'School Gymnasium',
        category: 'event'
      },
      {
        id: 4,
        title: 'Professional Development - Early Dismissal',
        date: '2023-10-06',
        description: 'Students will be dismissed at 1:30 PM.',
        location: 'Lincoln Elementary School',
        category: 'academic'
      },
      {
        id: 5,
        title: 'Parent-Teacher Conferences',
        date: '2023-10-15',
        description: 'Fall conferences day 1. By appointment only.',
        location: 'Classrooms',
        category: 'academic'
      },
      {
        id: 6,
        title: 'Parent-Teacher Conferences',
        date: '2023-10-16',
        description: 'Fall conferences day 2. By appointment only.',
        location: 'Classrooms',
        category: 'academic'
      },
      {
        id: 7,
        title: 'Fall Festival',
        date: '2023-10-28',
        description: 'School community event with games, food, and activities. 11AM - 3PM',
        location: 'School Grounds',
        category: 'event'
      },
      {
        id: 8,
        title: 'Veterans Day Program',
        date: '2023-11-10',
        description: 'Special assembly honoring veterans. Starts at 10:00 AM.',
        location: 'School Auditorium',
        category: 'event'
      },
      {
        id: 9,
        title: 'Thanksgiving Break - No School',
        date: '2023-11-22',
        description: 'School closed for Thanksgiving break (Nov 22-24).',
        location: null,
        category: 'holiday'
      },
      {
        id: 10,
        title: 'Winter Concert',
        date: '2023-12-14',
        description: 'Annual winter music program featuring all grade levels. Starts at 6:30 PM.',
        location: 'School Auditorium',
        category: 'event'
      },
      {
        id: 11,
        title: 'Winter Break Begins - No School',
        date: '2023-12-20',
        description: 'Winter break (Dec 20 - Jan 3). Classes resume January 4.',
        location: null,
        category: 'holiday'
      }
    ]);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Group events by month for the calendar view
  const groupEventsByMonth = () => {
    if (!events.length) return {};
    
    const grouped = {};
    
    events.forEach(event => {
      const date = new Date(event.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      
      grouped[monthYear].push(event);
    });
    
    // Sort events within each month by date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return grouped;
  };
  
  // Get chip color for event category
  const getEventCategoryColor = (category) => {
    switch (category) {
      case 'academic':
        return 'primary';
      case 'holiday':
        return 'error';
      case 'event':
        return 'success';
      default:
        return 'default';
    }
  };
  
  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        School Information
      </Typography>
      
      {error && !school && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {school && (
        <>
          {/* School Header Card */}
          <Card sx={{ mb: 4 }}>
            <Grid container>
              <Grid item xs={12} md={4}>
                <CardMedia
                  component="img"
                  image={school.logo || "https://placehold.co/400x150/3f51b5/white?text=School+Logo"}
                  alt={`${school.name} Logo`}
                  sx={{ 
                    height: { xs: 140, md: '100%' },
                    objectFit: 'cover' 
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {school.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                      {school.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                      {school.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                      {school.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PublicIcon fontSize="small" sx={{ mr: 1 }} />
                      <Link href={`https://${school.website}`} target="_blank" rel="noopener noreferrer">
                        {school.website}
                      </Link>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="body2">
                      <strong>Principal:</strong> {school.principalName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Grades:</strong> {school.grades}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Student Enrollment:</strong> {school.studentCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          </Card>
          
          {/* Tabs */}
          <Paper sx={{ width: '100%', mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="school information tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab 
                  label="About" 
                  id="school-tab-0" 
                  aria-controls="school-tabpanel-0" 
                  icon={<SchoolIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Announcements" 
                  id="school-tab-1" 
                  aria-controls="school-tabpanel-1" 
                  icon={<AnnouncementIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Staff Directory" 
                  id="school-tab-2" 
                  aria-controls="school-tabpanel-2" 
                  icon={<PeopleIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Academic Calendar" 
                  id="school-tab-3" 
                  aria-controls="school-tabpanel-3" 
                  icon={<EventIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            
            {/* About Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    About Our School
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {school.description}
                  </Typography>
                  
                  <Box sx={{ my: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Our Mission
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {school.mission}
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                      Our Vision
                    </Typography>
                    <Typography variant="body1">
                      {school.vision}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Quick Facts
                  </Typography>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table sx={{ minWidth: 400 }} size="small" aria-label="school facts table">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            Year Founded
                          </TableCell>
                          <TableCell align="right">{school.yearFounded}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            Grades Served
                          </TableCell>
                          <TableCell align="right">{school.grades}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            Student Enrollment
                          </TableCell>
                          <TableCell align="right">{school.studentCount}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            Principal
                          </TableCell>
                          <TableCell align="right">{school.principalName}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contact Information
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <LocationOnIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="School Address" 
                            secondary={school.address}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PhoneIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Main Office" 
                            secondary={school.phone}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <EmailIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Email" 
                            secondary={school.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar>
                              <PublicIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary="Website" 
                            secondary={
                              <Link href={`https://${school.website}`} target="_blank" rel="noopener noreferrer">
                                {school.website}
                              </Link>
                            }
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        School Hours
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" scope="row">Monday - Friday</TableCell>
                              <TableCell align="right">8:00 AM - 3:00 PM</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">Office Hours</TableCell>
                              <TableCell align="right">7:30 AM - 4:00 PM</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">Early Dismissal</TableCell>
                              <TableCell align="right">1:30 PM</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Announcements Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                School Announcements
              </Typography>
              
              {announcements.length === 0 ? (
                <Alert severity="info">
                  There are currently no announcements.
                </Alert>
              ) : (
                <Box>
                  {/* Important Announcements */}
                  {announcements.some(announcement => announcement.important) && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                        Important Announcements
                      </Typography>
                      <Grid container spacing={2}>
                        {announcements
                          .filter(announcement => announcement.important)
                          .map(announcement => (
                            <Grid item xs={12} key={announcement.id}>
                              <Card variant="outlined" sx={{ borderLeft: '4px solid', borderLeftColor: 'error.main' }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                    <Typography variant="h6" component="div">
                                      {announcement.title}
                                    </Typography>
                                    <Chip 
                                      label="Important" 
                                      color="error" 
                                      size="small"
                                    />
                                  </Box>
                                  <Typography variant="body2" sx={{ mb: 2 }}>
                                    {announcement.content}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Posted on {formatDate(announcement.date)}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                      </Grid>
                    </Box>
                  )}
                  
                  {/* Regular Announcements */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Recent Announcements
                    </Typography>
                    <Grid container spacing={2}>
                      {announcements
                        .filter(announcement => !announcement.important)
                        .map(announcement => (
                          <Grid item xs={12} sm={6} key={announcement.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Typography variant="h6" component="div" gutterBottom>
                                  {announcement.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {announcement.content}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Posted on {formatDate(announcement.date)}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                </Box>
              )}
            </TabPanel>
            
            {/* Staff Directory Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Staff Directory
              </Typography>
              
              {staff.length === 0 ? (
                <Alert severity="info">
                  Staff directory information is not available.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {/* Administration Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Administration
                    </Typography>
                    <Grid container spacing={2}>
                      {staff
                        .filter(person => ['Principal', 'Assistant Principal'].includes(person.position))
                        .map(person => (
                          <Grid item xs={12} sm={6} md={4} key={person.id}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar 
                                    src={person.photoUrl} 
                                    alt={person.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                  />
                                  <Box>
                                    <Typography variant="h6" component="div">
                                      {person.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {person.position}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" paragraph>
                                  {person.bio}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                                  {person.email}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                                  {person.phone}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                  
                  {/* Support Staff Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      Support Staff
                    </Typography>
                    <Grid container spacing={2}>
                      {staff
                        .filter(person => !['Principal', 'Assistant Principal'].includes(person.position))
                        .map(person => (
                          <Grid item xs={12} sm={6} md={4} key={person.id}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar 
                                    src={person.photoUrl} 
                                    alt={person.name}
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                  />
                                  <Box>
                                    <Typography variant="h6" component="div">
                                      {person.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {person.position}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" paragraph>
                                  {person.bio}
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                                  {person.email}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                                  {person.phone}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </TabPanel>
            
            {/* Academic Calendar Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Academic Calendar
              </Typography>
              
              {events.length === 0 ? (
                <Alert severity="info">
                  Calendar information is not available.
                </Alert>
              ) : (
                <Box>
                  {/* Event category legend */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                    <Chip icon={<EventIcon />} label="Academic" color="primary" variant="outlined" />
                    <Chip icon={<EventIcon />} label="Event" color="success" variant="outlined" />
                    <Chip icon={<EventIcon />} label="Holiday" color="error" variant="outlined" />
                  </Box>
                  
                  {/* Events by month */}
                  {Object.entries(groupEventsByMonth()).map(([month, monthEvents]) => (
                    <Box key={month} sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ 
                        borderBottom: '2px solid', 
                        borderBottomColor: 'primary.main',
                        pb: 1,
                        display: 'inline-block'
                      }}>
                        {month}
                      </Typography>
                      
                      <TableContainer component={Paper} variant="outlined">
                        <Table sx={{ minWidth: 650 }} aria-label="calendar events table">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Event</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Category</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {monthEvents.map((event) => (
                              <TableRow key={event.id}>
                                <TableCell component="th" scope="row">
                                  {formatDate(event.date)}
                                </TableCell>
                                <TableCell><strong>{event.title}</strong></TableCell>
                                <TableCell>{event.description}</TableCell>
                                <TableCell>{event.location || 'N/A'}</TableCell>
                                <TableCell>
                                  <Chip 
                                    label={event.category.charAt(0).toUpperCase() + event.category.slice(1)} 
                                    color={getEventCategoryColor(event.category)}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Box>
              )}
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default SchoolInfo;
