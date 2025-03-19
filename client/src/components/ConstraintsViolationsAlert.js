import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  School as SchoolIcon,
  Balance as BalanceIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { CONSTRAINT_TYPES } from '../services/constraintService';

/**
 * Component to display constraint violations with detailed information
 * @param {Object} props
 * @param {Array} props.violations - Array of constraint violation objects
 * @param {Function} props.onClose - Function to call when the alert is closed
 * @param {boolean} props.open - Whether the alert is open
 */
const ConstraintsViolationsAlert = ({ violations = [], onClose, open = true }) => {
  if (!violations || violations.length === 0 || !open) {
    return null;
  }

  // Group violations by priority
  const requiredViolations = violations.filter(v => v.priority === 'required');
  const highViolations = violations.filter(v => v.priority === 'high');
  const mediumViolations = violations.filter(v => v.priority === 'medium');
  const lowViolations = violations.filter(v => v.priority === 'low');

  // Helper to get icon for constraint type
  const getConstraintIcon = (type) => {
    switch (type) {
      case CONSTRAINT_TYPES.MUST_BE_TOGETHER:
        return <LinkIcon />;
      case CONSTRAINT_TYPES.MUST_BE_SEPARATE:
        return <LinkOffIcon />;
      case CONSTRAINT_TYPES.PREFERRED_TEACHER:
      case CONSTRAINT_TYPES.AVOID_TEACHER:
        return <SchoolIcon />;
      case CONSTRAINT_TYPES.BALANCED_DISTRIBUTION:
        return <BalanceIcon />;
      case CONSTRAINT_TYPES.EQUAL_CLASS_SIZE:
        return <GroupIcon />;
      default:
        return <WarningIcon />;
    }
  };

  // Helper to get severity for constraint priority
  const getSeverity = (priority) => {
    switch (priority) {
      case 'required':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
  };

  const renderViolationList = (violationList, priority) => {
    if (violationList.length === 0) return null;

    return (
      <Alert 
        severity={getSeverity(priority)} 
        sx={{ mb: 1 }}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              if (onClose) onClose(priority);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle>
          {priority === 'required' ? 'Required Constraints Not Satisfied' :
           priority === 'high' ? 'High Priority Constraints Not Satisfied' :
           priority === 'medium' ? 'Medium Priority Constraints Not Satisfied' :
           'Low Priority Constraints Not Satisfied'}
        </AlertTitle>
        <List dense>
          {violationList.map((violation, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {getConstraintIcon(violation.type)}
              </ListItemIcon>
              <ListItemText
                primary={violation.message}
                secondary={violation.reason ? `Reason: ${violation.reason}` : ''}
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    );
  };

  return (
    <Collapse in={open}>
      <Paper sx={{ mb: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 1 }}>
          {requiredViolations.length > 0 && renderViolationList(requiredViolations, 'required')}
          {highViolations.length > 0 && renderViolationList(highViolations, 'high')}
          {mediumViolations.length > 0 && renderViolationList(mediumViolations, 'medium')}
          {lowViolations.length > 0 && renderViolationList(lowViolations, 'low')}
        </Box>
      </Paper>
    </Collapse>
  );
};

export default ConstraintsViolationsAlert; 