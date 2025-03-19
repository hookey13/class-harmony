import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { CloudUpload, CheckCircle, Error } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const DataImport = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [mappingComplete, setMappingComplete] = useState(false);

  const steps = ['Upload File', 'Preview & Validate', 'Map Fields', 'Import'];

  const systemFields = [
    { id: 'firstName', label: 'First Name', required: true },
    { id: 'lastName', label: 'Last Name', required: true },
    { id: 'grade', label: 'Grade', required: true },
    { id: 'gender', label: 'Gender', required: false },
    { id: 'academicLevel', label: 'Academic Level', required: false },
    { id: 'behaviorNotes', label: 'Behavior Notes', required: false },
    { id: 'specialNeeds', label: 'Special Needs', required: false },
    { id: 'parentEmail', label: 'Parent Email', required: false },
  ];

  const handleFileUpload = (event) => {
    setError(null);
    const uploadedFile = event.target.files[0];
    
    if (!uploadedFile) return;

    const fileType = uploadedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileType)) {
      setError('Please upload a CSV or Excel file');
      return;
    }

    setFile(uploadedFile);
    parseFile(uploadedFile);
  };

  const parseFile = async (uploadedFile) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (parsedData.length < 2) {
          setError('File appears to be empty or invalid');
          setLoading(false);
          return;
        }

        setHeaders(parsedData[0]);
        setPreviewData(parsedData.slice(1, 6)); // Preview first 5 rows
        validateData(parsedData);
        setActiveStep(1);
        setLoading(false);
      };
      reader.readAsArrayBuffer(uploadedFile);
    } catch (err) {
      setError('Error parsing file: ' + err.message);
      setLoading(false);
    }
  };

  const validateData = (data) => {
    const headers = data[0];
    const requiredFields = ['First Name', 'Last Name', 'Grade'];
    const validation = {
      missingFields: [],
      duplicates: 0,
      emptyRows: 0,
      totalRows: data.length - 1
    };

    // Check for required fields
    requiredFields.forEach(field => {
      if (!headers.includes(field)) {
        validation.missingFields.push(field);
      }
    });

    // Check for duplicates and empty rows
    const studentSet = new Set();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length === 0 || row.every(cell => !cell)) {
        validation.emptyRows++;
        continue;
      }

      const studentKey = `${row[headers.indexOf('First Name')]}-${row[headers.indexOf('Last Name')]}-${row[headers.indexOf('Grade')]}`;
      if (studentSet.has(studentKey)) {
        validation.duplicates++;
      }
      studentSet.add(studentKey);
    }

    setValidationResults(validation);
  };

  const handleFieldMapping = (systemField, importedField) => {
    setFieldMapping(prev => ({
      ...prev,
      [systemField]: importedField
    }));

    // Check if all required fields are mapped
    const requiredFields = systemFields.filter(field => field.required);
    const allRequiredMapped = requiredFields.every(field => 
      fieldMapping[field.id] || field.id === systemField
    );
    
    setMappingComplete(allRequiredMapped);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      // Here you would typically send the mapped data to your backend
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to the final step
      setActiveStep(3);
    } catch (err) {
      setError('Error importing data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <input
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
        id="file-upload"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload />}
          sx={{ mb: 2 }}
        >
          Upload File
        </Button>
      </label>
      <Typography variant="body2" color="textSecondary">
        Supported formats: CSV, Excel (.xlsx, .xls)
      </Typography>
    </Box>
  );

  const renderPreviewStep = () => (
    <Box>
      {validationResults && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Validation Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Rows
                </Typography>
                <Typography variant="h6">
                  {validationResults.totalRows}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Duplicate Entries
                </Typography>
                <Typography variant="h6" color={validationResults.duplicates > 0 ? 'error' : 'success'}>
                  {validationResults.duplicates}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Empty Rows
                </Typography>
                <Typography variant="h6" color={validationResults.emptyRows > 0 ? 'warning' : 'success'}>
                  {validationResults.emptyRows}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Missing Fields
                </Typography>
                <Typography variant="h6" color={validationResults.missingFields.length > 0 ? 'error' : 'success'}>
                  {validationResults.missingFields.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {previewData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderFieldMapping = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map Fields
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Map the columns from your file to the required system fields. Required fields are marked with an asterisk (*).
      </Typography>
      
      <Grid container spacing={3}>
        {systemFields.map((field) => (
          <Grid item xs={12} sm={6} md={4} key={field.id}>
            <FormControl fullWidth>
              <InputLabel id={`map-${field.id}-label`}>
                {field.label} {field.required && '*'}
              </InputLabel>
              <Select
                labelId={`map-${field.id}-label`}
                value={fieldMapping[field.id] || ''}
                label={`${field.label} ${field.required ? '*' : ''}`}
                onChange={(e) => handleFieldMapping(field.id, e.target.value)}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {headers.map((header, index) => (
                  <MenuItem key={index} value={header}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!mappingComplete}
        >
          Import Data
        </Button>
      </Box>
    </Box>
  );

  const renderImportComplete = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
      <Typography variant="h5" gutterBottom>
        Import Complete
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Your data has been successfully imported into the system.
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          // Reset the form
          setActiveStep(0);
          setFile(null);
          setPreviewData(null);
          setHeaders([]);
          setFieldMapping({});
          setMappingComplete(false);
          setValidationResults(null);
        }}
      >
        Import More Data
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Data Import
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {activeStep === 0 && renderUploadStep()}
            {activeStep === 1 && renderPreviewStep()}
            {activeStep === 2 && renderFieldMapping()}
            {activeStep === 3 && renderImportComplete()}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default DataImport; 