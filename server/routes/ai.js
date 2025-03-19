const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const aiService = require('../services/aiService');

/**
 * @route   POST /api/ai/insights
 * @desc    Generate AI insights for class optimization
 * @access  Private (Admin)
 */
router.post('/insights', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData } = req.body;
    
    if (!classData || !classData.classes) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const insights = await aiService.generateInsights(classData);
    res.json(insights);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    res.status(500).json({ error: 'Error generating AI insights' });
  }
});

/**
 * @route   POST /api/ai/suggestions
 * @desc    Generate AI suggestions for optimizing class placement
 * @access  Private (Admin)
 */
router.post('/suggestions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData, academicYear, grade } = req.body;
    
    if (!classData || !classData.classes) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const suggestions = await aiService.generateSuggestions(classData, academicYear, grade);
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({ error: 'Error generating AI suggestions' });
  }
});

/**
 * @route   POST /api/ai/constraints/analysis
 * @desc    Generate AI constraint analysis for class optimization
 * @access  Private (Admin)
 */
router.post('/constraints/analysis', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData } = req.body;
    
    if (!classData) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const analysis = await aiService.analyzeConstraints(classData);
    res.json(analysis);
  } catch (error) {
    console.error('Error generating constraint analysis:', error);
    res.status(500).json({ error: 'Error generating constraint analysis' });
  }
});

/**
 * @route   POST /api/ai/placements/optimize
 * @desc    Generate AI-optimized student placements
 * @access  Private (Admin)
 */
router.post('/placements/optimize', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { 
      students, 
      academicYear, 
      grade, 
      classCount,
      constraints,
      weights
    } = req.body;
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Valid student data is required' });
    }
    
    if (!academicYear || grade === undefined || !classCount) {
      return res.status(400).json({ error: 'Academic year, grade, and class count are required' });
    }
    
    const optimizedPlacements = await aiService.optimizePlacements(
      students,
      academicYear,
      grade,
      classCount,
      constraints,
      weights
    );
    
    res.json(optimizedPlacements);
  } catch (error) {
    console.error('Error generating AI-optimized placements:', error);
    res.status(500).json({ error: 'Error generating AI-optimized placements' });
  }
});

/**
 * @route   POST /api/ai/score
 * @desc    Calculate AI-generated balance scores for classes
 * @access  Private (Admin)
 */
router.post('/score', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { classData } = req.body;
    
    if (!classData || !classData.classes) {
      return res.status(400).json({ error: 'Class data is required' });
    }
    
    const scores = await aiService.scoreClasses(classData);
    res.json(scores);
  } catch (error) {
    console.error('Error calculating AI class scores:', error);
    res.status(500).json({ error: 'Error calculating AI class scores' });
  }
});

module.exports = router; 