const ClassList = require('../../models/ClassList');
const Student = require('../../models/Student');
const Class = require('../../models/Class');
const TeacherSurvey = require('../../models/TeacherSurvey');
const ParentRequest = require('../../models/ParentRequest');

/**
 * Optimize class distribution based on specified factors
 * @route POST /api/class-lists/:id/optimize
 * @access Private
 */
exports.optimizeClassList = async (req, res) => {
  try {
    const { id } = req.params;
    const { factors = [], strategy = 'balanced' } = req.body;
    
    // Get class list details with populated data
    const classList = await ClassList.findById(id)
      .populate({
        path: 'students',
        model: 'Student'
      })
      .populate({
        path: 'classes',
        model: 'Class',
        populate: {
          path: 'students',
          model: 'Student'
        }
      })
      .populate({
        path: 'teachers',
        model: 'User'
      });
    
    if (!classList) {
      return res.status(404).json({ success: false, message: 'Class list not found' });
    }
    
    // Get all students for this grade/school
    const students = classList.students || [];
    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No students to optimize' });
    }
    
    // Get existing classes or create new ones if none exist
    let classes = classList.classes || [];
    const teacherIds = classList.teachers ? classList.teachers.map(t => t._id) : [];
    
    // If no classes, create them based on teachers
    if (classes.length === 0 && teacherIds.length > 0) {
      // Create classes in memory for optimization
      classes = teacherIds.map((teacherId, index) => ({
        _id: `temp_class_${Date.now()}_${index}`,
        name: `Class ${index + 1}`,
        teacherId,
        students: []
      }));
    }
    
    // If still no classes, we can't optimize
    if (classes.length === 0) {
      return res.status(400).json({ success: false, message: 'No classes to optimize' });
    }
    
    // Reset student assignments
    classes = classes.map(cls => ({ 
      ...cls, 
      students: [],
      _doc: {
        ...cls._doc,
        students: []
      }
    }));
    
    // Create student pools based on factors
    const studentPools = {};
    
    // Gender pools
    if (factors.includes('gender')) {
      studentPools.male = students.filter(s => s.gender === 'Male');
      studentPools.female = students.filter(s => s.gender === 'Female');
      studentPools.other = students.filter(s => s.gender !== 'Male' && s.gender !== 'Female');
    }
    
    // Academic level pools
    if (factors.includes('academicLevel')) {
      studentPools.advanced = students.filter(s => s.academicLevel === 'Advanced');
      studentPools.proficient = students.filter(s => s.academicLevel === 'Proficient');
      studentPools.basic = students.filter(s => s.academicLevel === 'Basic');
      studentPools.belowBasic = students.filter(s => s.academicLevel === 'Below Basic');
    }
    
    // Behavior level pools
    if (factors.includes('behaviorLevel')) {
      studentPools.highNeeds = students.filter(s => s.behaviorLevel === 'High');
      studentPools.mediumNeeds = students.filter(s => s.behaviorLevel === 'Medium');
      studentPools.lowNeeds = students.filter(s => s.behaviorLevel === 'Low');
    }
    
    // Special needs pool
    if (factors.includes('specialNeeds')) {
      studentPools.specialNeeds = students.filter(s => s.specialNeeds);
      studentPools.regularNeeds = students.filter(s => !s.specialNeeds);
    }
    
    // Get teacher compatibility data if needed
    if (factors.includes('teacherCompatibility')) {
      // Get teacher surveys for this class list
      const teacherSurveys = await TeacherSurvey.find({ classListId: id });
      
      if (teacherSurveys && teacherSurveys.length > 0) {
        const teacherPreferences = {};
        
        // Process teacher surveys to get preferred/challenging students
        teacherSurveys.forEach(survey => {
          if (!teacherPreferences[survey.teacherId]) {
            teacherPreferences[survey.teacherId] = {
              preferredStudents: [],
              challengingStudents: []
            };
          }
          
          // Add preferred students
          if (survey.preferredStudents && Array.isArray(survey.preferredStudents)) {
            teacherPreferences[survey.teacherId].preferredStudents.push(...survey.preferredStudents);
          }
          
          // Add challenging students
          if (survey.challengingStudents && Array.isArray(survey.challengingStudents)) {
            teacherPreferences[survey.teacherId].challengingStudents.push(...survey.challengingStudents);
          }
        });
        
        // Tag students based on teacher compatibility
        students.forEach(student => {
          student.teacherCompatibility = {};
          Object.keys(teacherPreferences).forEach(teacherId => {
            // Determine compatibility score: 1 (preferred), -1 (challenging), 0 (neutral)
            if (teacherPreferences[teacherId].preferredStudents.includes(student._id.toString())) {
              student.teacherCompatibility[teacherId] = 1;
            } else if (teacherPreferences[teacherId].challengingStudents.includes(student._id.toString())) {
              student.teacherCompatibility[teacherId] = -1;
            } else {
              student.teacherCompatibility[teacherId] = 0;
            }
          });
        });
      }
    }
    
    // Get parent requests if needed
    if (factors.includes('parentRequests')) {
      // Get approved parent requests for this class list
      const parentRequests = await ParentRequest.find({
        classListId: id,
        status: 'approved'
      });
      
      if (parentRequests && parentRequests.length > 0) {
        // Process parent requests
        students.forEach(student => {
          student.parentRequests = [];
          
          // Find requests for this student
          const requests = parentRequests.filter(req => req.studentId.toString() === student._id.toString());
          
          requests.forEach(request => {
            if (request.type === 'classmate' && request.targetStudentId) {
              student.parentRequests.push({
                type: 'classmate',
                targetStudentId: request.targetStudentId.toString()
              });
            } else if (request.type === 'teacher' && request.targetTeacherId) {
              student.parentRequests.push({
                type: 'teacher',
                targetTeacherId: request.targetTeacherId.toString()
              });
            }
          });
        });
      }
    }
    
    // Apply optimization strategy weights
    let factorWeights = {
      gender: 1,
      academicLevel: 1,
      behaviorLevel: 1,
      specialNeeds: 1,
      teacherCompatibility: 1,
      parentRequests: 1
    };
    
    // Adjust weights based on strategy
    switch (strategy) {
      case 'academic':
        factorWeights.academicLevel = 2;
        break;
      case 'behavior':
        factorWeights.behaviorLevel = 2;
        factorWeights.specialNeeds = 1.5;
        break;
      case 'requests':
        factorWeights.parentRequests = 2;
        factorWeights.teacherCompatibility = 1.5;
        break;
      // balanced is default with equal weights
    }
    
    // ADVANCED OPTIMIZATION ALGORITHM
    
    // Step 1: Distribute students with special needs first
    if (studentPools.specialNeeds && studentPools.specialNeeds.length > 0) {
      const specialNeedsPerClass = Math.ceil(studentPools.specialNeeds.length / classes.length);
      
      // Distribute special needs students as evenly as possible
      studentPools.specialNeeds.forEach((student, index) => {
        const classIndex = Math.floor(index / specialNeedsPerClass);
        if (classIndex < classes.length) {
          classes[classIndex].students.push(student);
        } else {
          // Overflow goes to the last class
          classes[classes.length - 1].students.push(student);
        }
      });
    }
    
    // Step 2: Honor approved parent requests where possible
    if (factors.includes('parentRequests')) {
      const studentsWithTeacherRequests = students.filter(s => 
        s.parentRequests && s.parentRequests.some(req => req.type === 'teacher')
      );
      
      // Place students with teacher requests
      studentsWithTeacherRequests.forEach(student => {
        if (classes.some(c => c.students.some(s => s._id.toString() === student._id.toString()))) return; // Skip if already placed
        
        const teacherRequest = student.parentRequests.find(req => req.type === 'teacher');
        if (teacherRequest) {
          const targetClass = classes.find(c => c.teacherId && c.teacherId.toString() === teacherRequest.targetTeacherId);
          if (targetClass) {
            targetClass.students.push(student);
          }
        }
      });
      
      // Handle classmate requests in pairs where possible
      const studentsWithClassmateRequests = students.filter(s => 
        s.parentRequests && s.parentRequests.some(req => req.type === 'classmate')
      );
      
      studentsWithClassmateRequests.forEach(student => {
        if (classes.some(c => c.students.some(s => s._id.toString() === student._id.toString()))) return; // Skip if already placed
        
        const classmateRequest = student.parentRequests.find(req => req.type === 'classmate');
        if (classmateRequest) {
          const targetStudent = students.find(s => s._id.toString() === classmateRequest.targetStudentId);
          
          // Check if target student is already placed
          if (targetStudent) {
            const targetClass = classes.find(c => c.students.some(s => s._id.toString() === targetStudent._id.toString()));
            if (targetClass) {
              targetClass.students.push(student);
            }
          }
        }
      });
    }
    
    // Step 3: Optimize for gender balance
    if (factors.includes('gender')) {
      const remainingStudents = {
        male: studentPools.male.filter(s => !classes.some(c => c.students.some(cs => cs._id.toString() === s._id.toString()))),
        female: studentPools.female.filter(s => !classes.some(c => c.students.some(cs => cs._id.toString() === s._id.toString()))),
        other: studentPools.other ? studentPools.other.filter(s => !classes.some(c => c.students.some(cs => cs._id.toString() === s._id.toString()))) : []
      };
      
      // Distribute remaining students by gender to balance classes
      ['male', 'female', 'other'].forEach(gender => {
        if (remainingStudents[gender] && remainingStudents[gender].length > 0) {
          // Calculate target count per class
          const studentsPerClass = Math.ceil(remainingStudents[gender].length / classes.length);
          
          // Sort classes by current gender count
          let sortedClasses = [...classes].sort((a, b) => 
            (a.students.filter(s => s.gender === gender.charAt(0).toUpperCase() + gender.slice(1)).length) - 
            (b.students.filter(s => s.gender === gender.charAt(0).toUpperCase() + gender.slice(1)).length)
          );
          
          // Distribute students
          remainingStudents[gender].forEach(student => {
            if (classes.some(c => c.students.some(cs => cs._id.toString() === student._id.toString()))) return; // Skip if already placed
            
            // Find class with fewest students of this gender
            sortedClasses[0].students.push(student);
            
            // Re-sort classes after adding a student
            sortedClasses = sortedClasses.sort((a, b) => 
              (a.students.filter(s => s.gender === gender.charAt(0).toUpperCase() + gender.slice(1)).length) - 
              (b.students.filter(s => s.gender === gender.charAt(0).toUpperCase() + gender.slice(1)).length)
            );
          });
        }
      });
    }
    
    // Step 4: Balance academic levels
    if (factors.includes('academicLevel')) {
      const academicLevels = ['advanced', 'proficient', 'basic', 'belowBasic'];
      
      academicLevels.forEach(level => {
        if (studentPools[level] && studentPools[level].length > 0) {
          // Filter for students not yet placed
          const remainingStudents = studentPools[level].filter(s => 
            !classes.some(c => c.students.some(cs => cs._id.toString() === s._id.toString()))
          );
          
          // Normalize the level name for comparison
          const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1);
          
          // Sort classes by current count of this academic level
          let sortedClasses = [...classes].sort((a, b) => 
            (a.students.filter(s => s.academicLevel === normalizedLevel).length) - 
            (b.students.filter(s => s.academicLevel === normalizedLevel).length)
          );
          
          // Distribute students
          remainingStudents.forEach(student => {
            if (classes.some(c => c.students.some(cs => cs._id.toString() === student._id.toString()))) return; // Skip if already placed
            
            // Find class with fewest students of this academic level
            sortedClasses[0].students.push(student);
            
            // Re-sort classes
            sortedClasses = sortedClasses.sort((a, b) => 
              (a.students.filter(s => s.academicLevel === normalizedLevel).length) - 
              (b.students.filter(s => s.academicLevel === normalizedLevel).length)
            );
          });
        }
      });
    }
    
    // Step 5: Balance behavior needs
    if (factors.includes('behaviorLevel')) {
      const behaviorLevels = ['highNeeds', 'mediumNeeds', 'lowNeeds'];
      
      behaviorLevels.forEach(level => {
        if (studentPools[level] && studentPools[level].length > 0) {
          // Filter for students not yet placed
          const remainingStudents = studentPools[level].filter(s => 
            !classes.some(c => c.students.some(cs => cs._id.toString() === s._id.toString()))
          );
          
          // Normalize the level name for comparison
          const normalizedLevel = level === 'highNeeds' ? 'High' : 
                                 level === 'mediumNeeds' ? 'Medium' : 'Low';
          
          // Sort classes by current count of this behavior level
          let sortedClasses = [...classes].sort((a, b) => 
            (a.students.filter(s => s.behaviorLevel === normalizedLevel).length) - 
            (b.students.filter(s => s.behaviorLevel === normalizedLevel).length)
          );
          
          // Distribute students
          remainingStudents.forEach(student => {
            if (classes.some(c => c.students.some(cs => cs._id.toString() === student._id.toString()))) return; // Skip if already placed
            
            // Find class with fewest students of this behavior level
            sortedClasses[0].students.push(student);
            
            // Re-sort classes
            sortedClasses = sortedClasses.sort((a, b) => 
              (a.students.filter(s => s.behaviorLevel === normalizedLevel).length) - 
              (b.students.filter(s => s.behaviorLevel === normalizedLevel).length)
            );
          });
        }
      });
    }
    
    // Step 6: Place any remaining students to balance class sizes
    const allPlacedStudentIds = classes.flatMap(c => c.students.map(s => s._id.toString()));
    const remainingStudents = students.filter(s => !allPlacedStudentIds.includes(s._id.toString()));
    
    // Sort classes by size
    let sizedSortedClasses = [...classes].sort((a, b) => a.students.length - b.students.length);
    
    // Distribute remaining students evenly
    remainingStudents.forEach(student => {
      sizedSortedClasses[0].students.push(student);
      sizedSortedClasses = sizedSortedClasses.sort((a, b) => a.students.length - b.students.length);
    });
    
    // Step 7: Final check and balancing if class sizes are too uneven
    const classSizes = classes.map(c => c.students.length);
    const maxSize = Math.max(...classSizes);
    const minSize = Math.min(...classSizes);
    
    if (maxSize - minSize > 2) {
      // Get classes that are too large
      const largeClasses = classes.filter(c => c.students.length > minSize + 1);
      
      // Get classes that are too small
      const smallClasses = classes.filter(c => c.students.length < maxSize - 1);
      
      // Move students from large to small classes
      largeClasses.forEach(largeClass => {
        smallClasses.forEach(smallClass => {
          if (largeClass.students.length > smallClass.students.length + 1) {
            // Find a student to move (preferably one without specific requests)
            const studentToMove = largeClass.students.find(s => 
              !s.parentRequests || s.parentRequests.length === 0
            ) || largeClass.students[largeClass.students.length - 1];
            
            // Move student
            largeClass.students = largeClass.students.filter(s => s !== studentToMove);
            smallClass.students.push(studentToMove);
          }
        });
      });
    }
    
    // Save the optimized classes to the database
    for (const classObj of classes) {
      if (classObj._id.toString().startsWith('temp_')) {
        // This is a new class, create it
        const newClass = new Class({
          name: classObj.name,
          teacherId: classObj.teacherId,
          students: classObj.students.map(s => s._id)
        });
        
        const savedClass = await newClass.save();
        
        // Add to class list
        classList.classes.push(savedClass._id);
      } else {
        // This is an existing class, update it
        await Class.findByIdAndUpdate(classObj._id, {
          students: classObj.students.map(s => s._id)
        });
      }
    }
    
    // Update class list with changes
    await classList.save();
    
    // Calculate optimization statistics
    const statistics = {
      totalStudents: students.length,
      studentsPlaced: classes.reduce((sum, c) => sum + c.students.length, 0),
      classCount: classes.length,
      averageClassSize: Math.round(students.length / classes.length)
    };
    
    // Add balance scores
    if (factors.includes('gender')) {
      statistics.genderBalance = calculateGenderBalance(classes);
    }
    
    if (factors.includes('academicLevel')) {
      statistics.academicBalance = calculateAcademicBalance(classes);
    }
    
    if (factors.includes('behaviorLevel')) {
      statistics.behaviorBalance = calculateBehaviorBalance(classes);
    }
    
    if (factors.includes('parentRequests')) {
      statistics.requestsFulfilled = calculateRequestsFulfillment(students, classes);
    }
    
    res.status(200).json({
      success: true,
      message: 'Classes optimized successfully',
      classes: classes.map(c => ({
        id: c._id,
        name: c.name,
        teacherId: c.teacherId,
        students: c.students.map(s => s._id)
      })),
      statistics
    });
  } catch (error) {
    console.error('Error optimizing class list:', error);
    res.status(500).json({ success: false, message: 'An error occurred while optimizing classes' });
  }
};

// Helper function to calculate gender balance score (0-100)
const calculateGenderBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const maleCount = cls.students.filter(s => s.gender === 'Male').length;
    const femaleCount = cls.students.filter(s => s.gender === 'Female').length;
    const otherCount = cls.students.filter(s => s.gender !== 'Male' && s.gender !== 'Female').length;
    
    // Perfect balance would be equal proportions, calculate deviation
    const maleRatio = maleCount / total;
    const femaleRatio = femaleCount / total;
    const otherRatio = otherCount / total;
    
    // Ideal ratios (simplified as even distribution between male/female)
    const idealMaleRatio = 0.5;
    const idealFemaleRatio = 0.5;
    const idealOtherRatio = 0; // Simplified, adjust as needed
    
    // Calculate deviation from ideal (0 = perfect, 1 = worst)
    const deviation = (
      Math.abs(maleRatio - idealMaleRatio) + 
      Math.abs(femaleRatio - idealFemaleRatio) + 
      Math.abs(otherRatio - idealOtherRatio)
    ) / 2; // Normalize to 0-1
    
    // Convert to score (100 = perfect, 0 = worst)
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate academic balance score (0-100)
const calculateAcademicBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const advancedCount = cls.students.filter(s => s.academicLevel === 'Advanced').length;
    const proficientCount = cls.students.filter(s => s.academicLevel === 'Proficient').length;
    const basicCount = cls.students.filter(s => s.academicLevel === 'Basic').length;
    const belowBasicCount = cls.students.filter(s => s.academicLevel === 'Below Basic').length;
    
    // Calculate ratios
    const advancedRatio = advancedCount / total;
    const proficientRatio = proficientCount / total;
    const basicRatio = basicCount / total;
    const belowBasicRatio = belowBasicCount / total;
    
    // Simplified ideal ratios (equal distribution)
    const idealRatio = 0.25;
    
    // Calculate deviation
    const deviation = (
      Math.abs(advancedRatio - idealRatio) + 
      Math.abs(proficientRatio - idealRatio) + 
      Math.abs(basicRatio - idealRatio) + 
      Math.abs(belowBasicRatio - idealRatio)
    ) / 4;
    
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate behavior balance score (0-100)
const calculateBehaviorBalance = (classes) => {
  return classes.map(cls => {
    const total = cls.students.length;
    if (total === 0) return 100; // Empty class is balanced
    
    const highCount = cls.students.filter(s => s.behaviorLevel === 'High').length;
    const mediumCount = cls.students.filter(s => s.behaviorLevel === 'Medium').length;
    const lowCount = cls.students.filter(s => s.behaviorLevel === 'Low').length;
    
    // High needs students should be distributed evenly
    const highRatio = highCount / total;
    const mediumRatio = mediumCount / total;
    const lowRatio = lowCount / total;
    
    // Ideal distribution would have fewer high needs, more low needs
    const idealHighRatio = 0.2;
    const idealMediumRatio = 0.3;
    const idealLowRatio = 0.5;
    
    // Calculate weighted deviation (high needs deviation is more important)
    const deviation = (
      Math.abs(highRatio - idealHighRatio) * 1.5 + 
      Math.abs(mediumRatio - idealMediumRatio) * 1.0 + 
      Math.abs(lowRatio - idealLowRatio) * 0.5
    ) / 3;
    
    return Math.round((1 - deviation) * 100);
  });
};

// Helper function to calculate request fulfillment percentage
const calculateRequestsFulfillment = (students, classes) => {
  const studentsWithRequests = students.filter(s => s.parentRequests && s.parentRequests.length > 0);
  if (studentsWithRequests.length === 0) return 100; // No requests to fulfill
  
  let fulfilledCount = 0;
  
  studentsWithRequests.forEach(student => {
    // Find which class this student is in
    const studentClass = classes.find(c => c.students.some(s => s._id.toString() === student._id.toString()));
    if (!studentClass) return;
    
    // Check if requests were fulfilled
    let allRequestsFulfilled = true;
    
    student.parentRequests.forEach(request => {
      if (request.type === 'teacher') {
        // Teacher request
        if (studentClass.teacherId.toString() !== request.targetTeacherId.toString()) {
          allRequestsFulfilled = false;
        }
      } else if (request.type === 'classmate') {
        // Classmate request
        const targetStudent = students.find(s => s._id.toString() === request.targetStudentId.toString());
        if (!targetStudent || !studentClass.students.some(s => s._id.toString() === targetStudent._id.toString())) {
          allRequestsFulfilled = false;
        }
      }
    });
    
    if (allRequestsFulfilled) {
      fulfilledCount++;
    }
  });
  
  return Math.round((fulfilledCount / studentsWithRequests.length) * 100);
}; 