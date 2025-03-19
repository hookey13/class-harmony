import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Psychology as PsychologyIcon,
  Accessibility as AccessibilityIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  StarRate as StarRateIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

/**
 * Student Profile Card - displays comprehensive student information
 * 
 * @param {Object} student - Student data object
 * @param {Function} onEdit - Function to call when edit button is clicked
 * @returns {JSX.Element}
 */
const StudentProfileCard = ({ student, onEdit }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Helper function to get academic level color
  const getAcademicLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return 'success';
      case 'Proficient': return 'info';
      case 'Basic': return 'warning';
      case 'Below Basic': return 'error';
      default: return 'default';
    }
  };

  // Helper function to get behavior level color
  const getBehaviorLevelColor = (level) => {
    switch (level) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  // Helper function to capitalize first letter
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle missing student data gracefully
  if (!student) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            No student data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Render personal information tab
  const renderPersonalInfo = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Full Name" 
              secondary={`${student.firstName} ${student.lastName}`} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Student ID" 
              secondary={student.id} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SchoolIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Grade Level" 
              secondary={student.grade} 
            />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={12} sm={6}>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Age" 
              secondary={student.age || 'Not specified'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Gender" 
              secondary={student.gender || 'Not specified'} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Date of Birth" 
              secondary={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'Not specified'} 
            />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={12}>
        <Divider />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Additional Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {student.additionalInfo || 'No additional information provided'}
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );

  // Render academic data tab
  const renderAcademicData = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Academic Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Academic Level:
          </Typography>
          <Chip 
            label={student.academicLevel || 'Not assessed'} 
            color={getAcademicLevelColor(student.academicLevel)}
            size="small"
          />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Subject Proficiency
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {renderSubjectProficiency('Mathematics', student.subjectProficiency?.mathematics || 70)}
          {renderSubjectProficiency('Reading', student.subjectProficiency?.reading || 65)}
          {renderSubjectProficiency('Science', student.subjectProficiency?.science || 80)}
          {renderSubjectProficiency('Social Studies', student.subjectProficiency?.socialStudies || 75)}
          {renderSubjectProficiency('Writing', student.subjectProficiency?.writing || 60)}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Academic History
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Academic Year</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Academic Level</TableCell>
              <TableCell>GPA</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {student.academicHistory ? (
              student.academicHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.academicYear}</TableCell>
                  <TableCell>{entry.grade}</TableCell>
                  <TableCell>
                    <Chip 
                      label={entry.academicLevel} 
                      color={getAcademicLevelColor(entry.academicLevel)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.gpa}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No academic history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          size="small" 
          startIcon={<AssignmentIcon />}
          onClick={() => window.alert('View full academic record')}
        >
          View Full Academic Record
        </Button>
      </Box>
    </Box>
  );

  // Helper function to render subject proficiency
  const renderSubjectProficiency = (subject, score) => (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="body2" gutterBottom>
        {subject}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            color={
              score >= 80 ? 'success' :
              score >= 60 ? 'info' :
              score >= 40 ? 'warning' : 'error'
            }
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${score}%`}</Typography>
        </Box>
      </Box>
    </Grid>
  );

  // Render behavioral data tab
  const renderBehavioralData = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Current Behavioral Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Behavior Level:
          </Typography>
          <Chip 
            label={student.behaviorLevel || 'Not assessed'} 
            color={getBehaviorLevelColor(student.behaviorLevel)}
            size="small"
          />
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Behavioral Metrics
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {renderBehaviorMetric('Attendance', student.behaviorMetrics?.attendance || 90)}
          {renderBehaviorMetric('Classroom Conduct', student.behaviorMetrics?.conduct || 85)}
          {renderBehaviorMetric('Participation', student.behaviorMetrics?.participation || 75)}
          {renderBehaviorMetric('Collaboration', student.behaviorMetrics?.collaboration || 80)}
          {renderBehaviorMetric('Work Completion', student.behaviorMetrics?.workCompletion || 85)}
        </Grid>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Behavioral Notes
      </Typography>
      
      <List dense>
        {student.behavioralNotes ? (
          student.behavioralNotes.map((note, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemIcon>
                {note.type === 'positive' ? 
                  <CheckCircleIcon color="success" /> : 
                  <WarningIcon color="warning" />
                }
              </ListItemIcon>
              <ListItemText
                primary={`${note.date ? new Date(note.date).toLocaleDateString() : 'Date not specified'} - ${note.title}`}
                secondary={note.description}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No behavioral notes recorded" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  // Helper function to render behavior metric
  const renderBehaviorMetric = (metric, score) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="body2" gutterBottom>
        {metric}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={score} 
            color={
              score >= 80 ? 'success' :
              score >= 60 ? 'info' :
              score >= 40 ? 'warning' : 'error'
            }
            sx={{ height: 8, borderRadius: 5 }}
          />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${score}%`}</Typography>
        </Box>
      </Box>
    </Grid>
  );

  // Render special needs tab
  const renderSpecialNeeds = () => (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Special Needs Status:
          </Typography>
          <Chip 
            label={student.specialNeeds ? 'Has Special Needs' : 'No Special Needs Indicated'} 
            color={student.specialNeeds ? 'secondary' : 'default'}
          />
        </Box>
      </Box>
      
      {student.specialNeeds && (
        <>
          <Typography variant="subtitle2" gutterBottom>
            Accommodations & Services
          </Typography>
          
          <List dense>
            {student.accommodations ? (
              student.accommodations.map((accommodation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AccessibilityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={accommodation.type}
                    secondary={accommodation.description}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No accommodations specified" />
              </ListItem>
            )}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            IEP Information
          </Typography>
          
          {student.iepInfo ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="IEP Status"
                      secondary={student.iepInfo.status}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Review Date"
                      secondary={student.iepInfo.lastReviewDate ? new Date(student.iepInfo.lastReviewDate).toLocaleDateString() : 'Not specified'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Next Review Date"
                      secondary={student.iepInfo.nextReviewDate ? new Date(student.iepInfo.nextReviewDate).toLocaleDateString() : 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Case Manager"
                      secondary={student.iepInfo.caseManager || 'Not assigned'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {student.iepInfo.notes || 'No additional notes'}
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No IEP information available
            </Typography>
          )}
        </>
      )}
      
      {!student.specialNeeds && (
        <Typography variant="body2" color="text.secondary">
          This student does not have any documented special needs or accommodations.
        </Typography>
      )}
    </Box>
  );

  // Render parent contact tab
  const renderParentContacts = () => (
    <Box>
      {student.parents && student.parents.length > 0 ? (
        student.parents.map((parent, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {parent.relationship || 'Parent/Guardian'}: {parent.firstName} {parent.lastName}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={parent.email || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={parent.phone || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} sm={6}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Preferred Contact Method"
                      secondary={capitalize(parent.preferredContactMethod) || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Language"
                      secondary={parent.language || 'English'}
                    />
                  </ListItem>
                </List>
              </Grid>
              {parent.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Notes:</strong> {parent.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          No parent/guardian information available
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          size="small" 
          startIcon={<PeopleIcon />}
          onClick={() => window.alert('View communication history')}
        >
          View Communication History
        </Button>
      </Box>
    </Box>
  );

  // Render student history tab
  const renderHistory = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Class Assignment History
      </Typography>
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Academic Year</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {student.classHistory ? (
              student.classHistory.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.academicYear}</TableCell>
                  <TableCell>{entry.grade}</TableCell>
                  <TableCell>{entry.className}</TableCell>
                  <TableCell>{entry.teacherName}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No class history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Divider sx={{ my: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Parent Requests History
      </Typography>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Academic Year</TableCell>
              <TableCell>Request Type</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {student.requestHistory ? (
              student.requestHistory.map((request, index) => (
                <TableRow key={index}>
                  <TableCell>{request.academicYear}</TableCell>
                  <TableCell>{capitalize(request.type)}</TableCell>
                  <TableCell>{request.details}</TableCell>
                  <TableCell>
                    <Chip 
                      label={capitalize(request.status)} 
                      color={
                        request.status === 'approved' ? 'success' :
                        request.status === 'pending' ? 'warning' :
                        request.status === 'rejected' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No parent request history available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              bgcolor: student.gender === 'Male' ? 'primary.main' : 'secondary.main',
              width: 56,
              height: 56 
            }}
          >
            {student.firstName ? student.firstName.charAt(0) : ''}
            {student.lastName ? student.lastName.charAt(0) : ''}
          </Avatar>
        }
        action={
          <IconButton aria-label="edit" onClick={() => onEdit && onEdit(student)}>
            <EditIcon />
          </IconButton>
        }
        title={
          <Typography variant="h6">
            {student.firstName} {student.lastName}
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip 
              icon={<SchoolIcon />} 
              label={`Grade ${student.grade}`} 
              size="small" 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={student.academicLevel || 'Not assessed'} 
              size="small" 
              color={getAcademicLevelColor(student.academicLevel)} 
            />
            {student.specialNeeds && (
              <Chip 
                icon={<AccessibilityIcon />} 
                label="Special Needs" 
                size="small" 
                color="secondary" 
              />
            )}
          </Box>
        }
      />
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab 
            icon={<PersonIcon />} 
            label="Personal Info" 
            iconPosition="start"
          />
          <Tab 
            icon={<SchoolIcon />} 
            label="Academic" 
            iconPosition="start"
          />
          <Tab 
            icon={<PsychologyIcon />} 
            label="Behavioral" 
            iconPosition="start"
          />
          <Tab 
            icon={<AccessibilityIcon />} 
            label="Special Needs" 
            iconPosition="start"
          />
          <Tab 
            icon={<PeopleIcon />} 
            label="Parents" 
            iconPosition="start"
          />
          <Tab 
            icon={<HistoryIcon />} 
            label="History" 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      <CardContent>
        {activeTab === 0 && renderPersonalInfo()}
        {activeTab === 1 && renderAcademicData()}
        {activeTab === 2 && renderBehavioralData()}
        {activeTab === 3 && renderSpecialNeeds()}
        {activeTab === 4 && renderParentContacts()}
        {activeTab === 5 && renderHistory()}
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Button 
          size="small" 
          color="primary"
          startIcon={<AssignmentIcon />}
          onClick={() => window.alert('View learning plan')}
        >
          Learning Plan
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {student.currentClass ? (
          <Tooltip title={`Current Class: ${student.currentClass.className}`}>
            <Chip 
              icon={<SchoolIcon />} 
              label={`${student.currentClass.className} - ${student.currentClass.teacherName}`} 
              color="primary" 
              variant="outlined" 
              size="small" 
            />
          </Tooltip>
        ) : (
          <Chip 
            label="Not assigned to class" 
            color="default" 
            variant="outlined" 
            size="small" 
          />
        )}
      </CardActions>
    </Card>
  );
};

export default StudentProfileCard; 