import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  IconButton,
  Divider,
  FormHelperText,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';

// CSV template for download
const CSV_TEMPLATE = [
  ['firstName', 'lastName', 'gender', 'academicLevel', 'behaviorLevel', 'specialNeeds', 'notes'],
  ['John', 'Smith', 'Male', 'Advanced', 'Low', 'false', 'Example student'],
  ['Emma', 'Johnson', 'Female', 'Proficient', 'Medium', 'false', ''],
  ['Michael', 'Williams', 'Male', 'Basic', 'High', 'true', 'IEP for reading'],
];

// Import steps
const steps = ['Upload File', 'Map Columns', 'Review & Import'];

// Required student fields
const requiredFields = ['firstName', 'lastName', 'gender'];

// Student fields with options
const fieldOptions = {
  gender: ['Male', 'Female', 'Other'],
  academicLevel: ['Advanced', 'Proficient', 'Basic', 'Below Basic'],
  behaviorLevel: ['Low', 'Medium', 'High'],
};

const StudentImport = () => {
  const {
    selectedSchool,
    gradeLevels,
    isLoading,
    gradeLevelsLoading,
    studentsLoading,
    error: dataError,
    importStudents,
    fetchGradeLevels,
  } = useData();
  
  const { createNotification } = useNotifications();

  const navigate = useNavigate();

  // State for the current step
  const [activeStep, setActiveStep] = useState(0);

  // File state
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);

  // Grade level state
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [gradeLevelCode, setGradeLevelCode] = useState('');

  // Column mapping state
  const [columnMappings, setColumnMappings] = useState({});
  const [mappingErrors, setMappingErrors] = useState({});

  // Import result state
  const [importResult, setImportResult] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  // Error and loading state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Load grade levels when component mounts
  useEffect(() => {
    if (selectedSchool && !gradeLevels.length) {
      fetchGradeLevels();
    }
  }, [selectedSchool, gradeLevels.length, fetchGradeLevels]);

  // File dropzone configuration
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFile(file);
    setError(null);

    // Check file type
    const fileType = file.name.split('.').pop().toLowerCase();
    
    if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setFileData(results.data);
            setHeaders(results.meta.fields || []);
            
            // Create initial mappings
            const initialMappings = {};
            results.meta.fields.forEach(field => {
              // Try to automatically map columns based on name
              const lowerField = field.toLowerCase().replace(/\s/g, '');
              const matchingField = ['firstName', 'lastName', 'gender', 'academicLevel', 'behaviorLevel', 'specialNeeds', 'notes']
                .find(f => f.toLowerCase() === lowerField);
              
              if (matchingField) {
                initialMappings[field] = matchingField;
              }
            });
            
            setColumnMappings(initialMappings);
          } else {
            setError('No data found in the CSV file');
          }
        },
        error: (error) => {
          setError(`Error parsing CSV: ${error.message}`);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileType)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData && jsonData.length > 1) {
            const headers = jsonData[0];
            const rows = jsonData.slice(1).map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] === undefined ? '' : row[index];
              });
              return obj;
            });
            
            setFileData(rows);
            setHeaders(headers);
            
            // Create initial mappings
            const initialMappings = {};
            headers.forEach(field => {
              if (typeof field === 'string') {
                // Try to automatically map columns based on name
                const lowerField = field.toLowerCase().replace(/\s/g, '');
                const matchingField = ['firstName', 'lastName', 'gender', 'academicLevel', 'behaviorLevel', 'specialNeeds', 'notes']
                  .find(f => f.toLowerCase() === lowerField);
                
                if (matchingField) {
                  initialMappings[field] = matchingField;
                }
              }
            });
            
            setColumnMappings(initialMappings);
          } else {
            setError('No data found in the Excel file');
          }
        } catch (err) {
          setError(`Error parsing Excel file: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Unsupported file type. Please upload a CSV or Excel file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  // Handle grade level change
  const handleGradeLevelChange = (event) => {
    const gradeId = event.target.value;
    setSelectedGradeLevel(gradeId);
    
    // Find the grade level code
    const grade = gradeLevels.find(g => g.id === gradeId);
    if (grade) {
      setGradeLevelCode(grade.code);
    }
  };

  // Handle column mapping change
  const handleMappingChange = (header, value) => {
    setColumnMappings(prev => ({
      ...prev,
      [header]: value
    }));
  };

  // Validate mappings
  const validateMappings = () => {
    const errors = {};
    let valid = true;

    // Check that all required fields are mapped
    requiredFields.forEach(field => {
      const isMapped = Object.values(columnMappings).includes(field);
      if (!isMapped) {
        errors[field] = `${field} is required`;
        valid = false;
      }
    });

    // Check for duplicate mappings
    const mappedFields = Object.values(columnMappings).filter(Boolean);
    const uniqueMappedFields = new Set(mappedFields);
    
    if (mappedFields.length !== uniqueMappedFields.size) {
      errors.duplicate = 'Duplicate mappings found';
      valid = false;
    }

    setMappingErrors(errors);
    return valid;
  };

  // Process data with mappings
  const processData = () => {
    if (!fileData.length) return [];
    
    const processed = fileData.map(row => {
      const newRow = {};
      
      // Map each field according to the mapping
      Object.entries(columnMappings).forEach(([header, field]) => {
        if (field) {
          // Convert boolean fields
          if (field === 'specialNeeds') {
            const value = row[header];
            if (typeof value === 'string') {
              newRow[field] = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
            } else {
              newRow[field] = !!value;
            }
          } else {
            newRow[field] = row[header];
          }
        }
      });
      
      return newRow;
    });
    
    return processed;
  };

  // Generate preview data
  const generatePreview = () => {
    const processed = processData();
    // Take first 5 records for preview
    setPreviewData(processed.slice(0, 5));
    return processed;
  };

  // Handle import
  const handleImport = async () => {
    if (!selectedGradeLevel || !gradeLevelCode) {
      setError('Please select a grade level');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const processedData = processData();
      
      if (!processedData.length) {
        setError('No data to import');
        setLoading(false);
        return;
      }
      
      const result = await importStudents(processedData, gradeLevelCode);
      
      if (result && result.success) {
        // Create notification
        createNotification({
          type: 'studentImport',
          title: 'Student Import Completed',
          message: `Successfully imported ${result.count} students to Grade ${gradeLevelCode}`,
          sendEmail: true,
          emailDetails: {
            subject: 'Student Import Completed',
            body: `Your student import has completed. ${result.count} students were successfully imported to Grade ${gradeLevelCode}.`
          }
        });
        
        setImportResult({
          success: true,
          count: result.count,
          message: `Successfully imported ${result.count} students`
        });
        
        setSnackbar({
          open: true,
          message: `Successfully imported ${result.count} students`,
          severity: 'success'
        });
      } else {
        throw new Error('Import failed');
      }
    } catch (err) {
      setError(`Import failed: ${err.message}`);
      setImportResult({
        success: false,
        message: `Import failed: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    // Convert the template to a CSV string
    const csvContent = Papa.unparse(CSV_TEMPLATE);
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset the form
  const handleReset = () => {
    setActiveStep(0);
    setFile(null);
    setFileData([]);
    setHeaders([]);
    setColumnMappings({});
    setMappingErrors({});
    setImportResult(null);
    setPreviewData([]);
    setError(null);
  };

  // Handle step navigation
  const handleNext = () => {
    if (activeStep === 0 && !file) {
      setError('Please upload a file');
      return;
    }
    
    if (activeStep === 0 && !selectedGradeLevel) {
      setError('Please select a grade level');
      return;
    }
    
    if (activeStep === 1) {
      // Validate mappings before proceeding
      if (!validateMappings()) return;
      
      // Generate preview data
      generatePreview();
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Render the step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: isDragActive ? 'primary.main' : 'divider',
                    bgcolor: isDragActive ? 'rgba(0, 0, 0, 0.04)' : 'background.paper',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Drag & Drop or Click to Upload
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={(e) => e.stopPropagation()}
                    {...getRootProps()}
                  >
                    Upload File
                  </Button>
                </Paper>
                {file && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setFileData([]);
                          setHeaders([]);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {(file.size / 1024).toFixed(2)} KB • {fileData.length} records
                    </Typography>
                  </Box>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Select Grade Level
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Choose the grade level for the students you're importing
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="grade-level-label">Grade Level</InputLabel>
                      <Select
                        labelId="grade-level-label"
                        id="grade-level"
                        value={selectedGradeLevel}
                        label="Grade Level"
                        onChange={handleGradeLevelChange}
                      >
                        {gradeLevels.map(grade => (
                          <MenuItem key={grade.id} value={grade.id}>
                            {grade.name || `Grade ${grade.code}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>
                      Need a Template?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Download our CSV template to ensure your data is formatted correctly
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Map Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Map the columns from your file to the required student fields
            </Typography>
            
            <Grid container spacing={3}>
              {headers.map(header => (
                <Grid item xs={12} sm={6} md={4} key={header}>
                  <FormControl 
                    fullWidth 
                    error={Object.values(mappingErrors).some(err => 
                      err.includes(columnMappings[header]) || 
                      (mappingErrors.duplicate && columnMappings[header])
                    )}
                  >
                    <InputLabel id={`mapping-${header}`}>{header}</InputLabel>
                    <Select
                      labelId={`mapping-${header}`}
                      value={columnMappings[header] || ''}
                      label={header}
                      onChange={(e) => handleMappingChange(header, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Do not import</em>
                      </MenuItem>
                      <MenuItem value="firstName">First Name</MenuItem>
                      <MenuItem value="lastName">Last Name</MenuItem>
                      <MenuItem value="gender">Gender</MenuItem>
                      <MenuItem value="academicLevel">Academic Level</MenuItem>
                      <MenuItem value="behaviorLevel">Behavior Level</MenuItem>
                      <MenuItem value="specialNeeds">Special Needs</MenuItem>
                      <MenuItem value="notes">Notes</MenuItem>
                    </Select>
                    {Object.keys(mappingErrors).includes(columnMappings[header]) && (
                      <FormHelperText>{mappingErrors[columnMappings[header]]}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              ))}
            </Grid>
            
            {mappingErrors.duplicate && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {mappingErrors.duplicate} - Each student field can only be mapped once
              </Alert>
            )}
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required Fields:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {requiredFields.join(', ')}
              </Typography>
            </Box>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review & Import
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review the data before importing. Showing first 5 records as preview.
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {Object.values(columnMappings)
                      .filter(Boolean)
                      .map(field => (
                        <TableCell key={field}>
                          <Typography variant="subtitle2">
                            {field}
                            {requiredFields.includes(field) && ' *'}
                          </Typography>
                        </TableCell>
                      ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(columnMappings)
                        .filter(Boolean)
                        .map(field => (
                          <TableCell key={field}>
                            {field === 'specialNeeds' 
                              ? (row[field] ? 'Yes' : 'No')
                              : row[field] || '-'}
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Import Summary
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Total Records: {fileData.length}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Grade Level: {gradeLevels.find(g => g.id === selectedGradeLevel)?.name || `Grade ${gradeLevelCode}`}
                  </Typography>
                  <Typography variant="body2">
                    Fields to Import: {Object.values(columnMappings).filter(Boolean).length}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Import Notes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • This will add students to the selected grade level
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Students will be assigned unique IDs automatically
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • You can assign students to classes after import
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {importResult && (
              <Alert 
                severity={importResult.success ? 'success' : 'error'}
                sx={{ mt: 3 }}
                action={
                  importResult.success ? (
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => navigate('/class-lists')}
                    >
                      View Class Lists
                    </Button>
                  ) : null
                }
              >
                {importResult.message}
              </Alert>
            )}
          </Box>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Import
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Import students from a CSV or Excel file to populate your class lists
      </Typography>
      
      {/* Error display */}
      {(error || dataError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || dataError}
        </Alert>
      )}
      
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {/* Step content */}
      {getStepContent(activeStep)}
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={activeStep === 0 ? <RefreshIcon /> : <BackIcon />}
          disabled={loading}
          onClick={activeStep === 0 ? handleReset : handleBack}
        >
          {activeStep === 0 ? 'Reset' : 'Back'}
        </Button>
        
        <Button
          variant="contained"
          endIcon={
            activeStep === steps.length - 1 ? (
              loading ? <CircularProgress size={20} /> : <SaveIcon />
            ) : (
              <ForwardIcon />
            )
          }
          onClick={activeStep === steps.length - 1 ? handleImport : handleNext}
          disabled={loading || (activeStep === 0 && (!file || !selectedGradeLevel))}
        >
          {activeStep === steps.length - 1 ? (
            loading ? 'Importing...' : (importResult?.success ? 'Imported' : 'Import Students')
          ) : (
            'Next'
          )}
        </Button>
      </Box>
      
      {/* Success snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbar({ ...snackbar, open: false })}>
            <CheckIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default StudentImport; 