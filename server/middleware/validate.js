const { validationResult } = require('express-validator');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Common validation rules
const rules = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please provide a valid email address'
  },
  password: {
    isLength: { min: 8 },
    errorMessage: 'Password must be at least 8 characters long'
  },
  name: {
    trim: true,
    notEmpty: true,
    escape: true,
    errorMessage: 'Name is required'
  },
  phone: {
    matches: /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    errorMessage: 'Please provide a valid phone number'
  },
  date: {
    isISO8601: true,
    toDate: true,
    errorMessage: 'Please provide a valid date'
  },
  id: {
    isMongoId: true,
    errorMessage: 'Please provide a valid ID'
  }
};

// Role-based access control middleware
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied' });
    }
    
    next();
  };
};

// Sanitization middleware
const sanitize = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  // Sanitize request query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  next();
};

// Custom validation middleware for specific use cases
const customValidators = {
  isValidGrade: (value) => {
    const validGrades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
    return validGrades.includes(value);
  },
  
  isValidClassSize: (value) => {
    return value >= 10 && value <= 30;
  },
  
  isValidTimeFormat: (value) => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
  },
  
  isValidSchoolYear: (value) => {
    const currentYear = new Date().getFullYear();
    return value >= currentYear && value <= currentYear + 1;
  }
};

module.exports = {
  validateRequest,
  rules,
  checkRole,
  sanitize,
  customValidators
}; 