import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  RateReview as RateReviewIcon,
  Group as GroupIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`collab-tabpanel-${index}`}
      aria-labelledby={`collab-tab-${index}`}
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

const TeacherCollaboration = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for tab
  const [tabValue, setTabValue] = useState(0);
  
  // State for placement discussions
  const [placements, setPlacements] = useState([]);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [comment, setComment] = useState('');
  
  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  
  // Fetch placement data
  useEffect(() => {
    const fetchPlacements = async () => {
      setLoading(true);
      try {
        // In production, this would be a real API call
        // const response = await api.get('/teacher/collaborations');
        // setPlacements(response.data.placements);
        
        // For development purposes, we'll use mock data
        setTimeout(() => {
          provideMockData();
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching placement data:', err);
        setError('Failed to load placement discussions. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchPlacements();
  }, []);
  
  // Provide mock data
  const provideMockData = () => {
    const mockPlacements = [
      {
        id: 1,
        studentName: 'Emma Johnson',
        studentId: 101,
        studentGrade: '3',
        studentPhoto: 'https://placehold.co/100/9c27b0/white?text=EJ',
        currentClass: 'Grade 3 - Room 102',
        recommendedClass: 'Grade 4 - Room 201',
        status: 'in_progress',
        teacherRecommendation: 'Student would benefit from a structured environment with clear expectations.',
        parentRequest: 'Parent has requested a teacher who can challenge the student academically.',
        adminNotes: 'Consider classroom dynamics and balance of student needs.',
        updatedAt: '2023-05-05T14:30:00Z',
        comments: [
          {
            id: 1,
            author: 'Ms. Rodriguez',
            authorRole: 'Grade 3 Teacher',
            text: 'Emma thrives with hands-on learning activities and does well in small group settings.',
            timestamp: '2023-05-03T10:15:00Z'
          },
          {
            id: 2,
            author: 'Mr. Thompson',
            authorRole: 'Grade 4 Teacher',
            text: 'I would be happy to have Emma in my class. I use project-based learning which might engage her well.',
            timestamp: '2023-05-04T11:20:00Z'
          }
        ],
        reactions: {
          agree: 3,
          disagree: 0
        }
      },
      {
        id: 2,
        studentName: 'Noah Smith',
        studentId: 102,
        studentGrade: '3',
        studentPhoto: 'https://placehold.co/100/2196f3/white?text=NS',
        currentClass: 'Grade 3 - Room 105',
        recommendedClass: 'Grade 4 - Room 203',
        status: 'in_progress',
        teacherRecommendation: 'Noah works best in a quiet environment with clear structure. He has made great progress in reading this year.',
        parentRequest: 'Parent has requested to separate Noah from another student, Jacob Wilson.',
        adminNotes: 'Consider behavior support needs and classroom dynamics.',
        updatedAt: '2023-05-04T09:45:00Z',
        comments: [
          {
            id: 3,
            author: 'Ms. Chen',
            authorRole: 'Grade 3 Teacher',
            text: 'Noah has shown significant growth in self-regulation this year. He works well with specific peers but should be separated from Jacob.',
            timestamp: '2023-05-02T14:30:00Z'
          }
        ],
        reactions: {
          agree: 2,
          disagree: 1
        }
      },
      {
        id: 3,
        studentName: 'Olivia Davis',
        studentId: 103,
        studentGrade: '3',
        studentPhoto: 'https://placehold.co/100/4caf50/white?text=OD',
        currentClass: 'Grade 3 - Room 102',
        recommendedClass: 'Grade 4 - Room 202',
        status: 'approved',
        teacherRecommendation: 'Olivia excels academically and would benefit from enrichment opportunities. She sometimes struggles with peer relationships.',
        parentRequest: 'No specific parent request received.',
        adminNotes: 'Placement approved by principal on May 3rd.',
        updatedAt: '2023-05-03T16:00:00Z',
        comments: [
          {
            id: 4,
            author: 'Ms. Rodriguez',
            authorRole: 'Grade 3 Teacher',
            text: 'Olivia is academically advanced but needs support with social skills. She works well with structured activities and clear expectations.',
            timestamp: '2023-05-01T11:45:00Z'
          },
          {
            id: 5,
            author: 'Ms. Johnson',
            authorRole: 'Grade 4 Teacher',
            text: 'I think Olivia would do well in my class. I can provide the academic challenge she needs while supporting her social development.',
            timestamp: '2023-05-02T13:15:00Z'
          },
          {
            id: 6,
            author: 'Dr. Martinez',
            authorRole: 'Principal',
            text: 'Placement approved. This seems like a good fit based on the student\'s needs and teacher recommendations.',
            timestamp: '2023-05-03T15:45:00Z'
          }
        ],
        reactions: {
          agree: 5,
          disagree: 0
        }
      }
    ];
    
    setPlacements(mockPlacements);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle placement selection
  const handleSelectPlacement = (placement) => {
    setSelectedPlacement(placement);
  };
  
  // Handle comment change
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
  
  // Handle comment submission
  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    
    // In production, this would be a real API call
    // const response = await api.post(`/teacher/collaborations/${selectedPlacement.id}/comments`, { text: comment });
    
    // For development purposes, we'll simulate adding a comment
    const newComment = {
      id: Date.now(),
      author: 'Current Teacher',
      authorRole: 'Grade 3 Teacher',
      text: comment,
      timestamp: new Date().toISOString()
    };
    
    // Update the selected placement with the new comment
    setSelectedPlacement(prev => ({
      ...prev,
      comments: [...prev.comments, newComment]
    }));
    
    // Update the placements list
    setPlacements(prev => prev.map(p => 
      p.id === selectedPlacement.id ? 
        {...p, comments: [...p.comments, newComment]} : 
        p
    ));
    
    // Clear comment field
    setComment('');
  };
  
  // Handle reaction (agree/disagree)
  const handleReaction = (placementId, type) => {
    // In production, this would be a real API call
    // const response = await api.post(`/teacher/collaborations/${placementId}/reactions`, { type });
    
    // For development purposes, we'll simulate adding a reaction
    setPlacements(prev => prev.map(p => {
      if (p.id === placementId) {
        const updatedReactions = {...p.reactions};
        if (type === 'agree') {
          updatedReactions.agree += 1;
        } else if (type === 'disagree') {
          updatedReactions.disagree += 1;
        }
        return {...p, reactions: updatedReactions};
      }
      return p;
    }));
    
    // Update selected placement if it's the one we're reacting to
    if (selectedPlacement && selectedPlacement.id === placementId) {
      setSelectedPlacement(prev => {
        const updatedReactions = {...prev.reactions};
        if (type === 'agree') {
          updatedReactions.agree += 1;
        } else if (type === 'disagree') {
          updatedReactions.disagree += 1;
        }
        return {...prev, reactions: updatedReactions};
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      // Yesterday
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Within a week
      return `${diffDays} days ago`;
    } else {
      // More than a week
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'in_progress': return 'warning';
      case 'denied': return 'error';
      default: return 'default';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'in_progress': return 'In Discussion';
      case 'denied': return 'Denied';
      default: return status;
    }
  };
  
  // Filter placements based on tab
  const getFilteredPlacements = () => {
    if (tabValue === 0) {
      return placements;
    } else if (tabValue === 1) {
      return placements.filter(p => p.status === 'in_progress');
    } else if (tabValue === 2) {
      return placements.filter(p => p.status === 'approved');
    }
    return placements;
  };
  
  // Count placements by status
  const inProgressCount = placements.filter(p => p.status === 'in_progress').length;
  const approvedCount = placements.filter(p => p.status === 'approved').length;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <RateReviewIcon fontSize="large" sx={{ mr: 1 }} />
        Placement Collaboration
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body1">
              Collaborate with other teachers and administrators on student placement decisions for the next academic year. 
              Review recommendations, provide insights, and discuss optimal placements to ensure student success.
            </Typography>
          </Paper>
          
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="placement tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab 
                label={
                  <Badge badgeContent={placements.length} color="primary">
                    All Placements
                  </Badge>
                } 
                id="collab-tab-0" 
                aria-controls="collab-tabpanel-0"
              />
              <Tab 
                label={
                  <Badge badgeContent={inProgressCount} color="warning">
                    In Discussion
                  </Badge>
                } 
                id="collab-tab-1" 
                aria-controls="collab-tabpanel-1"
              />
              <Tab 
                label={
                  <Badge badgeContent={approvedCount} color="success">
                    Approved
                  </Badge>
                } 
                id="collab-tab-2" 
                aria-controls="collab-tabpanel-2"
              />
            </Tabs>
          </Box>
          
          {/* Split view with list and details */}
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Placement list */}
            <Grid item xs={12} md={5}>
              <TabPanel value={tabValue} index={0}>
                <PlacementList 
                  placements={getFilteredPlacements()} 
                  selectedId={selectedPlacement?.id}
                  onSelect={handleSelectPlacement}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <PlacementList 
                  placements={getFilteredPlacements()} 
                  selectedId={selectedPlacement?.id}
                  onSelect={handleSelectPlacement}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <PlacementList 
                  placements={getFilteredPlacements()} 
                  selectedId={selectedPlacement?.id}
                  onSelect={handleSelectPlacement}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                />
              </TabPanel>
            </Grid>
            
            {/* Placement details */}
            <Grid item xs={12} md={7}>
              {selectedPlacement ? (
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                      src={selectedPlacement.studentPhoto}
                      alt={selectedPlacement.studentName}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h5">
                        {selectedPlacement.studentName}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        Current: {selectedPlacement.currentClass} • Recommended: {selectedPlacement.recommendedClass}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                        <Chip
                          label={getStatusLabel(selectedPlacement.status)}
                          color={getStatusColor(selectedPlacement.status)}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Updated {formatDate(selectedPlacement.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <IconButton 
                        color="primary"
                        onClick={() => handleReaction(selectedPlacement.id, 'agree')}
                        title="Agree with recommendation"
                      >
                        <Badge badgeContent={selectedPlacement.reactions.agree} color="primary">
                          <ThumbUpIcon />
                        </Badge>
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleReaction(selectedPlacement.id, 'disagree')}
                        title="Disagree with recommendation"
                      >
                        <Badge badgeContent={selectedPlacement.reactions.disagree} color="error">
                          <ThumbDownIcon />
                        </Badge>
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Teacher Recommendation</Typography>
                      <Typography variant="body2" paragraph>
                        {selectedPlacement.teacherRecommendation}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1">Parent Request</Typography>
                      <Typography variant="body2" paragraph>
                        {selectedPlacement.parentRequest}
                      </Typography>
                    </Grid>
                    
                    {selectedPlacement.adminNotes && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1">Admin Notes</Typography>
                        <Typography variant="body2" paragraph>
                          {selectedPlacement.adminNotes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Discussion
                  </Typography>
                  
                  <List sx={{ mb: 2 }}>
                    {selectedPlacement.comments.map((comment) => (
                      <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.light' }}>
                            {comment.author.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">
                                {comment.author} ({comment.authorRole})
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={comment.text}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {selectedPlacement.status === 'in_progress' && (
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Add your insight or recommendation..."
                        value={comment}
                        onChange={handleCommentChange}
                        multiline
                        rows={2}
                        variant="outlined"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ ml: 1, alignSelf: 'stretch' }}
                        disabled={!comment.trim()}
                        onClick={handleSubmitComment}
                        startIcon={<SendIcon />}
                      >
                        Send
                      </Button>
                    </Box>
                  )}
                </Paper>
              ) : (
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.default'
                  }}
                >
                  <GroupIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" align="center">
                    Select a placement from the list to view details and collaborate
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

// Placement list component
const PlacementList = ({ 
  placements, 
  selectedId, 
  onSelect,
  getStatusColor,
  getStatusLabel,
  formatDate
}) => {
  if (placements.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No placements found in this category.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {placements.map((placement) => (
        <Card 
          key={placement.id} 
          sx={{ 
            mb: 2, 
            cursor: 'pointer',
            border: selectedId === placement.id ? '2px solid' : '1px solid',
            borderColor: selectedId === placement.id ? 'primary.main' : 'divider'
          }}
          onClick={() => onSelect(placement)}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={placement.studentPhoto}
                alt={placement.studentName}
                sx={{ mr: 2 }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" component="div">
                  {placement.studentName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Grade {placement.studentGrade}
                </Typography>
              </Box>
              <Chip
                label={getStatusLabel(placement.status)}
                color={getStatusColor(placement.status)}
                size="small"
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" noWrap>
                Current: {placement.currentClass}
              </Typography>
              <Typography variant="body2" noWrap>
                Recommended: {placement.recommendedClass}
              </Typography>
            </Box>
          </CardContent>
          
          <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Badge badgeContent={placement.comments.length} color="info" sx={{ mr: 2 }}>
                <CommentIcon fontSize="small" />
              </Badge>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ThumbUpIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{placement.reactions.agree}</Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {formatDate(placement.updatedAt)}
            </Typography>
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default TeacherCollaboration; 