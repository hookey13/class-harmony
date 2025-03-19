import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ClassRosterReport = ({ classes, assignments, academicYear, grade }) => {
  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const printRef = useRef(null);
  
  // Filter classes based on report type
  const classesToDisplay = reportType === 'all' 
    ? classes 
    : classes.filter(c => {
        const assignment = assignments.find(a => a.classId === c.id || a.classId === c._id);
        return reportType === 'assigned' ? assignment : !assignment;
      });
  
  // Get teacher assignment for a class
  const getTeacherForClass = (classId) => {
    return assignments.find(a => a.classId === classId || a.classId === classId);
  };
  
  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Class_Roster_${academicYear}_Grade${grade}`,
    onBeforeGetContent: () => {
      setLoading(true);
      return new Promise((resolve) => {
        setTimeout(() => {
          setLoading(false);
          resolve();
        }, 500);
      });
    }
  });
  
  // Handle PDF export
  const handleExportPDF = () => {
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Class Rosters - Grade ${grade} (${academicYear})`, 14, 15);
      doc.setFontSize(12);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);
      
      let yPos = 30;
      
      // Add each class
      classesToDisplay.forEach((classItem, classIndex) => {
        const teacher = getTeacherForClass(classItem.id || classItem._id);
        
        // Add class header
        doc.setFontSize(14);
        doc.setTextColor(0, 102, 204);
        yPos += 10;
        doc.text(`${classItem.name}${teacher ? ` - ${teacher.teacherName}` : ' - Unassigned'}`, 14, yPos);
        
        // Add student table
        const tableData = classItem.students.map(student => [
          `${student.firstName} ${student.lastName}`,
          student.gender || '-',
          student.academicLevel || '-',
          student.behavioralLevel || '-',
          student.specialNeeds ? 'Yes' : 'No'
        ]);
        
        const tableColumns = [
          'Student Name', 
          'Gender', 
          'Academic Level', 
          'Behavioral', 
          'Special Needs'
        ];
        
        yPos += 5;
        
        // Check if we need a new page
        if (yPos > 250 || classItem.students.length > 15) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.autoTable({
          startY: yPos,
          head: [tableColumns],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [66, 133, 244], textColor: 255 },
          margin: { top: 30 }
        });
        
        yPos = doc.previousAutoTable.finalY + 10;
        
        // Add a new page for the next class if needed
        if (classIndex < classesToDisplay.length - 1 && yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Save the PDF
      doc.save(`Class_Roster_${academicYear}_Grade${grade}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF report');
      
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h3">
            Class Roster Report
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={loading || classesToDisplay.length === 0}
            >
              Print
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              disabled={loading || classesToDisplay.length === 0}
            >
              Export PDF
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              label="Report Type"
            >
              <MenuItem value="all">All Classes</MenuItem>
              <MenuItem value="assigned">Assigned Classes Only</MenuItem>
              <MenuItem value="unassigned">Unassigned Classes Only</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : classesToDisplay.length > 0 ? (
          <Box ref={printRef} sx={{ minWidth: 650 }}>
            <Box sx={{ mb: 3, display: 'none', '@media print': { display: 'block' } }}>
              <Typography variant="h4" gutterBottom align="center">
                Class Rosters - Grade {grade}
              </Typography>
              <Typography variant="h5" gutterBottom align="center">
                {academicYear} Academic Year
              </Typography>
              <Typography variant="body2" gutterBottom align="center">
                Generated on {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            
            {classesToDisplay.map((classItem) => {
              const teacher = getTeacherForClass(classItem.id || classItem._id);
              
              return (
                <Accordion key={classItem.id || classItem._id} defaultExpanded sx={{ mb: 2 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: 'primary.light',
                      '@media print': {
                        bgcolor: 'white',
                        borderBottom: '2px solid #333'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <SchoolIcon sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        {classItem.name}
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        {teacher ? (
                          <Chip 
                            label={teacher.teacherName} 
                            color="primary" 
                            variant="outlined"
                            sx={{ 
                              fontWeight: 'bold',
                              '@media print': {
                                bgcolor: 'white',
                                border: '1px solid #333'
                              }
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Unassigned" 
                            color="default" 
                            variant="outlined"
                            sx={{ 
                              '@media print': {
                                bgcolor: 'white',
                                border: '1px solid #333'
                              }
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Chip 
                          label={`${classItem.students.length} students`} 
                          size="small"
                          sx={{ 
                            '@media print': {
                              bgcolor: 'white',
                              border: '1px solid #333'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Student Name</strong></TableCell>
                            <TableCell><strong>Gender</strong></TableCell>
                            <TableCell><strong>Academic Level</strong></TableCell>
                            <TableCell><strong>Behavioral</strong></TableCell>
                            <TableCell><strong>Special Needs</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        
                        <TableBody>
                          {classItem.students.map((student) => (
                            <TableRow key={student.id || student._id}>
                              <TableCell>
                                {student.firstName} {student.lastName}
                              </TableCell>
                              <TableCell>
                                {student.gender || '-'}
                              </TableCell>
                              <TableCell>
                                {student.academicLevel && (
                                  <Chip 
                                    label={student.academicLevel} 
                                    size="small"
                                    color={
                                      student.academicLevel === 'advanced' ? 'success' :
                                      student.academicLevel === 'proficient' ? 'primary' :
                                      student.academicLevel === 'developing' ? 'warning' :
                                      'error'
                                    }
                                    sx={{ 
                                      '@media print': {
                                        bgcolor: 'white !important',
                                        color: 'black !important',
                                        border: '1px solid #333'
                                      }
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {student.behavioralLevel && (
                                  <Chip 
                                    label={student.behavioralLevel} 
                                    size="small"
                                    color={
                                      student.behavioralLevel === 'excellent' ? 'success' :
                                      student.behavioralLevel === 'good' ? 'primary' :
                                      student.behavioralLevel === 'satisfactory' ? 'warning' :
                                      'error'
                                    }
                                    sx={{ 
                                      '@media print': {
                                        bgcolor: 'white !important',
                                        color: 'black !important',
                                        border: '1px solid #333'
                                      }
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                {student.specialNeeds ? (
                                  <Chip 
                                    label="Yes" 
                                    size="small" 
                                    color="secondary"
                                    sx={{ 
                                      '@media print': {
                                        bgcolor: 'white !important',
                                        color: 'black !important',
                                        border: '1px solid #333'
                                      }
                                    }}
                                  />
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info">
            No classes available for the selected report type
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ClassRosterReport; 