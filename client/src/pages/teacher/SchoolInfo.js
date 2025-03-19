import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Link,
  Chip
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  Event as EventIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Public as PublicIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// TabPanel component for tabs
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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TeacherSchoolInfo = () => {
  const { currentUser } = useAuth();
  
  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for school data
  const [schoolData, setSchoolData] = useState(null);
  
  // State for active tab
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch school data
  useEffect(() => {
    const fetchSchoolData = async () => {
      setLoading(true);
      try {
        // In production, this would be a real API call
        // const response = await api.get('/teacher/school-info');
        // setSchoolData(response.data);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          provideMockData();
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching school data:', err);
        setError('Failed to load school information. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSchoolData();
  }, []);
  
  // Provide mock data
  const provideMockData = () => {
    const mockData = {
      school: {
        name: 'Harmony Elementary School',
        logo: 'https://placehold.co/400x200/1976d2/white?text=Harmony+Elementary',
        address: '123 Education Lane, Learning City, LC 12345',
        phone: '(555) 123-4567',
        email: 'info@harmonyschool.edu',
        website: 'www.harmonyschool.edu',
        principalName: 'Dr. Maria Rodriguez',
        principalEmail: 'principal@harmonyschool.edu',
        principalPhoto: 'https://placehold.co/200/1976d2/white?text=Principal',
        mission: 'To provide a nurturing and inclusive learning environment where every student can discover their potential, develop essential skills, and grow into responsible, compassionate citizens ready to make positive contributions to society.',
        vision: 'We envision a community where education ignites curiosity, fosters creativity, and empowers students to become lifelong learners and thoughtful global citizens.'
      },
      calendar: {
        currentYear: '2022-2023',
        importantDates: [
          { id: 1, title: 'End of Year Surveys Due', date: '2023-05-25' },
          { id: 2, title: 'Final Day of School', date: '2023-06-15' },
          { id: 3, title: 'Staff Development Day', date: '2023-06-16' },
          { id: 4, title: 'Summer Break Begins', date: '2023-06-17' },
          { id: 5, title: 'New School Year Begins', date: '2023-08-28' }
        ],
        schoolHours: '8:30 AM - 3:30 PM',
        earlyDismissal: '1:30 PM (Wednesdays)'
      },
      staff: {
        administrators: [
          { id: 1, name: 'Dr. Maria Rodriguez', title: 'Principal', photo: 'https://placehold.co/100/1976d2/white?text=MR', email: 'principal@harmonyschool.edu' },
          { id: 2, name: 'Michael Chen', title: 'Assistant Principal', photo: 'https://placehold.co/100/1976d2/white?text=MC', email: 'ap@harmonyschool.edu' },
          { id: 3, name: 'Sarah Johnson', title: 'Administrative Coordinator', photo: 'https://placehold.co/100/1976d2/white?text=SJ', email: 'admin@harmonyschool.edu' }
        ],
        teachers: [
          { id: 1, name: 'James Wilson', title: 'Grade 3 Teacher - Room 102', photo: 'https://placehold.co/100/4caf50/white?text=JW', email: 'jwilson@harmonyschool.edu' },
          { id: 2, name: 'Emily Turner', title: 'Grade 3 Teacher - Room 105', photo: 'https://placehold.co/100/4caf50/white?text=ET', email: 'eturner@harmonyschool.edu' },
          { id: 3, name: 'Robert Garcia', title: 'Grade 4 Teacher - Room 201', photo: 'https://placehold.co/100/4caf50/white?text=RG', email: 'rgarcia@harmonyschool.edu' },
          { id: 4, name: 'Lisa Anderson', title: 'Grade 4 Teacher - Room 202', photo: 'https://placehold.co/100/4caf50/white?text=LA', email: 'landerson@harmonyschool.edu' },
          { id: 5, name: 'Daniel Kim', title: 'Grade 4 Teacher - Room 203', photo: 'https://placehold.co/100/4caf50/white?text=DK', email: 'dkim@harmonyschool.edu' }
        ],
        specialists: [
          { id: 1, name: 'Patricia Lee', title: 'School Counselor', photo: 'https://placehold.co/100/ff9800/white?text=PL', email: 'plee@harmonyschool.edu' },
          { id: 2, name: 'Thomas Brown', title: 'Special Education Coordinator', photo: 'https://placehold.co/100/ff9800/white?text=TB', email: 'tbrown@harmonyschool.edu' },
          { id: 3, name: 'Jennifer Martinez', title: 'ELL Specialist', photo: 'https://placehold.co/100/ff9800/white?text=JM', email: 'jmartinez@harmonyschool.edu' },
          { id: 4, name: 'David Wilson', title: 'Technology Coordinator', photo: 'https://placehold.co/100/ff9800/white?text=DW', email: 'dwilson@harmonyschool.edu' }
        ]
      },
      policies: {
        placement: 'Student placement decisions are made collaboratively by grade-level teachers, specialists, and administrators. Factors considered include academic needs, social dynamics, learning styles, and creating balanced classrooms. Parent input through placement requests is also considered, though we cannot guarantee specific teacher requests. Final placement decisions are made by the principal.',
        attendance: 'Regular attendance is crucial for student success. Parents should notify the school office by 9:00 AM if a student will be absent. For planned absences of 3 or more days, please complete the Extended Absence Form available in the office or on our website.',
        behavioral: 'We foster a positive school environment through our PRIDE values: Perseverance, Respect, Integrity, Diversity, and Excellence. Students are recognized for demonstrating these values, and restorative practices are used to address behavioral concerns.',
        grading: 'We use a standards-based grading system to assess student progress toward grade-level expectations. Report cards are issued three times per year, with parent-teacher conferences scheduled in fall and spring.',
        communication: 'Communication between home and school is essential. Teachers send weekly newsletters and use the school communication app. Important announcements are shared via email, the school website, and social media channels. Parents can schedule meetings with teachers as needed.'
      },
      resources: {
        parentPortal: {
          title: 'Parent Portal',
          description: 'Access your child\'s information, submit placement requests, and communicate with teachers.',
          url: 'https://parent.harmonyschool.edu'
        },
        learningPlatform: {
          title: 'Harmony Learning Hub',
          description: 'Online platform with educational resources and activities for students.',
          url: 'https://learn.harmonyschool.edu'
        },
        curriculum: {
          title: 'Curriculum Resources',
          description: 'Information about grade-level curriculum, standards, and learning objectives.',
          url: 'https://harmonyschool.edu/curriculum'
        },
        communityPrograms: {
          title: 'Community Programs',
          description: 'After-school programs, summer camps, and community events.',
          url: 'https://harmonyschool.edu/community'
        }
      }
    };
    
    setSchoolData(mockData);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* School header */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center'
        }}
      >
        <Box 
          component="img"
          src={schoolData.school.logo}
          alt={schoolData.school.name}
          sx={{ 
            width: { xs: '100%', md: 200 },
            height: 'auto',
            mr: { md: 3 },
            mb: { xs: 2, md: 0 },
            borderRadius: 1
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SchoolIcon sx={{ mr: 1 }} />
            {schoolData.school.name}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{schoolData.school.address}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{schoolData.school.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <Link href={`mailto:${schoolData.school.email}`} color="inherit">
                    {schoolData.school.email}
                  </Link>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PublicIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <Link href={`https://${schoolData.school.website}`} target="_blank" rel="noopener noreferrer" color="inherit">
                    {schoolData.school.website}
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="school information tabs"
        >
          <Tab label="About" id="school-tab-0" aria-controls="school-tabpanel-0" icon={<InfoIcon />} iconPosition="start" />
          <Tab label="Staff Directory" id="school-tab-1" aria-controls="school-tabpanel-1" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Calendar" id="school-tab-2" aria-controls="school-tabpanel-2" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Policies" id="school-tab-3" aria-controls="school-tabpanel-3" icon={<DescriptionIcon />} iconPosition="start" />
          <Tab label="Resources" id="school-tab-4" aria-controls="school-tabpanel-4" icon={<PublicIcon />} iconPosition="start" />
        </Tabs>
        
        {/* About Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>Mission & Vision</Typography>
                <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                  <Typography variant="h6" gutterBottom>Our Mission</Typography>
                  <Typography paragraph>{schoolData.school.mission}</Typography>
                  
                  <Typography variant="h6" gutterBottom>Our Vision</Typography>
                  <Typography paragraph>{schoolData.school.vision}</Typography>
                </Paper>
                
                <Typography variant="h5" gutterBottom>School Hours</Typography>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1">Regular School Hours</Typography>
                      <Typography>{schoolData.calendar.schoolHours}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1">Early Dismissal</Typography>
                      <Typography>{schoolData.calendar.earlyDismissal}</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="h5" gutterBottom>School Leadership</Typography>
                <Card elevation={0} sx={{ mb: 2 }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={schoolData.school.principalPhoto}
                    alt={schoolData.school.principalName}
                  />
                  <CardContent>
                    <Typography variant="h6">{schoolData.school.principalName}</Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>Principal</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <Link href={`mailto:${schoolData.school.principalEmail}`} color="inherit">
                          {schoolData.school.principalEmail}
                        </Link>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
                
                <Box sx={{ mt: 3 }}>
                  <Button variant="outlined" fullWidth href={`https://${schoolData.school.website}`} target="_blank" rel="noopener noreferrer">
                    Visit School Website
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Staff Directory Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" gutterBottom>Administration</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {schoolData.staff.administrators.map((admin) => (
                <Grid item xs={12} sm={6} md={4} key={admin.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={admin.photo}
                        alt={admin.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">{admin.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{admin.title}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <Link href={`mailto:${admin.email}`} color="inherit">
                            {admin.email}
                          </Link>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="h5" gutterBottom>Teachers</Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {schoolData.staff.teachers.map((teacher) => (
                <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={teacher.photo}
                        alt={teacher.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">{teacher.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{teacher.title}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <Link href={`mailto:${teacher.email}`} color="inherit">
                            {teacher.email}
                          </Link>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Typography variant="h5" gutterBottom>Specialists & Support Staff</Typography>
            <Grid container spacing={2}>
              {schoolData.staff.specialists.map((specialist) => (
                <Grid item xs={12} sm={6} md={4} key={specialist.id}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={specialist.photo}
                        alt={specialist.name}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">{specialist.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{specialist.title}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <Link href={`mailto:${specialist.email}`} color="inherit">
                            {specialist.email}
                          </Link>
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Calendar Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                {schoolData.calendar.currentYear} Academic Year
              </Typography>
              <Typography variant="body1" paragraph>
                Below are important dates for the current academic year. For a complete calendar, please visit the school website.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1">Regular School Hours</Typography>
                  <Typography>{schoolData.calendar.schoolHours}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1.5, color: 'primary.main' }} />
                <Box>
                  <Typography variant="subtitle1">Early Dismissal</Typography>
                  <Typography>{schoolData.calendar.earlyDismissal}</Typography>
                </Box>
              </Box>
            </Paper>
            
            <Typography variant="h5" gutterBottom>Important Dates</Typography>
            <List>
              {schoolData.calendar.importantDates.map((event) => (
                <React.Fragment key={event.id}>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={event.title}
                      secondary={formatDate(event.date)}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        </TabPanel>
        
        {/* Policies Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" gutterBottom>School Policies</Typography>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Student Placement Policy</Typography>
              <Typography paragraph>{schoolData.policies.placement}</Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Attendance Policy</Typography>
              <Typography paragraph>{schoolData.policies.attendance}</Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Behavioral Expectations</Typography>
              <Typography paragraph>{schoolData.policies.behavioral}</Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Grading & Assessment</Typography>
              <Typography paragraph>{schoolData.policies.grading}</Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Communication</Typography>
              <Typography paragraph>{schoolData.policies.communication}</Typography>
            </Paper>
          </Box>
        </TabPanel>
        
        {/* Resources Tab */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" gutterBottom>School Resources</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {schoolData.resources.parentPortal.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {schoolData.resources.parentPortal.description}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      href={schoolData.resources.parentPortal.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Access Portal
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {schoolData.resources.learningPlatform.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {schoolData.resources.learningPlatform.description}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      href={schoolData.resources.learningPlatform.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Access Learning Hub
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {schoolData.resources.curriculum.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {schoolData.resources.curriculum.description}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      href={schoolData.resources.curriculum.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Curriculum
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {schoolData.resources.communityPrograms.title}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {schoolData.resources.communityPrograms.description}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      href={schoolData.resources.communityPrograms.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Explore Programs
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default TeacherSchoolInfo; 