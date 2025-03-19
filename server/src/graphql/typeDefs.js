const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date
  scalar JSON

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    active: Boolean!
    lastLogin: Date
    createdAt: Date!
    updatedAt: Date!
    schools: [School]
  }

  type School {
    id: ID!
    name: String!
    address: String
    city: String
    state: String
    zipCode: String
    phone: String
    website: String
    active: Boolean!
    subscription: String!
    subscriptionStart: Date
    subscriptionEnd: Date
    maxStudents: Int!
    user: User!
    gradeLevels: [GradeLevel]
    teachers: [Teacher]
    students: [Student]
    classLists: [ClassList]
    createdAt: Date!
    updatedAt: Date!
  }

  type GradeLevel {
    id: ID!
    name: String!
    school: School!
    students: [Student]
    teachers: [Teacher]
    classLists: [ClassList]
    createdAt: Date!
    updatedAt: Date!
  }

  type Teacher {
    id: ID!
    name: String!
    email: String
    active: Boolean!
    school: School!
    gradeLevel: GradeLevel
    classes: [Class]
    createdAt: Date!
    updatedAt: Date!
  }

  type Student {
    id: ID!
    firstName: String!
    lastName: String!
    gender: String
    dateOfBirth: Date
    active: Boolean!
    academicLevel: String
    behaviorLevel: String
    specialNeeds: Boolean
    specialNeedsDetails: String
    school: School!
    gradeLevel: GradeLevel!
    class: Class
    attributes: JSON
    createdAt: Date!
    updatedAt: Date!
  }

  type Class {
    id: ID!
    name: String!
    school: School!
    gradeLevel: GradeLevel!
    teacher: Teacher
    students: [Student]
    createdAt: Date!
    updatedAt: Date!
  }

  type ClassList {
    id: ID!
    name: String!
    schoolYear: String!
    status: String!
    school: School!
    gradeLevel: GradeLevel!
    classes: [Class]
    createdAt: Date!
    updatedAt: Date!
  }

  type TeacherSurvey {
    id: ID!
    title: String!
    description: String
    status: String!
    school: School!
    gradeLevel: GradeLevel!
    questions: JSON!
    responses: [TeacherSurveyResponse]
    createdAt: Date!
    updatedAt: Date!
  }

  type TeacherSurveyResponse {
    id: ID!
    teacher: Teacher!
    survey: TeacherSurvey!
    answers: JSON!
    completed: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type ParentRequest {
    id: ID!
    student: Student!
    requestType: String!
    requestDetails: String!
    status: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    # User queries
    me: User
    users: [User]
    user(id: ID!): User

    # School queries
    schools: [School]
    school(id: ID!): School

    # GradeLevel queries
    gradeLevels(schoolId: ID!): [GradeLevel]
    gradeLevel(id: ID!): GradeLevel

    # Teacher queries
    teachers(schoolId: ID!, gradeLevelId: ID): [Teacher]
    teacher(id: ID!): Teacher

    # Student queries
    students(schoolId: ID!, gradeLevelId: ID): [Student]
    student(id: ID!): Student

    # Class queries
    classes(schoolId: ID!, gradeLevelId: ID!): [Class]
    class(id: ID!): Class

    # ClassList queries
    classLists(schoolId: ID!, gradeLevelId: ID, schoolYear: String): [ClassList]
    classList(id: ID!): ClassList

    # TeacherSurvey queries
    teacherSurveys(schoolId: ID!, gradeLevelId: ID): [TeacherSurvey]
    teacherSurvey(id: ID!): TeacherSurvey
    teacherSurveyResponses(surveyId: ID!): [TeacherSurveyResponse]

    # ParentRequest queries
    parentRequests(schoolId: ID!, gradeLevelId: ID, status: String): [ParentRequest]
    parentRequest(id: ID!): ParentRequest
  }

  type Mutation {
    # User mutations
    register(name: String!, email: String!, password: String!, role: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateUser(id: ID!, name: String, email: String, role: String, active: Boolean): User
    deleteUser(id: ID!): Boolean

    # School mutations
    createSchool(name: String!, address: String, city: String, state: String, zipCode: String, phone: String, website: String): School
    updateSchool(id: ID!, name: String, address: String, city: String, state: String, zipCode: String, phone: String, website: String, active: Boolean, subscription: String, maxStudents: Int): School
    deleteSchool(id: ID!): Boolean

    # GradeLevel mutations
    createGradeLevel(schoolId: ID!, name: String!): GradeLevel
    updateGradeLevel(id: ID!, name: String): GradeLevel
    deleteGradeLevel(id: ID!): Boolean

    # Teacher mutations
    createTeacher(schoolId: ID!, name: String!, email: String, gradeLevelId: ID): Teacher
    updateTeacher(id: ID!, name: String, email: String, gradeLevelId: ID, active: Boolean): Teacher
    deleteTeacher(id: ID!): Boolean

    # Student mutations
    createStudent(schoolId: ID!, gradeLevelId: ID!, firstName: String!, lastName: String!, gender: String, dateOfBirth: Date, academicLevel: String, behaviorLevel: String, specialNeeds: Boolean, specialNeedsDetails: String, attributes: JSON): Student
    updateStudent(id: ID!, firstName: String, lastName: String, gender: String, dateOfBirth: Date, academicLevel: String, behaviorLevel: String, specialNeeds: Boolean, specialNeedsDetails: String, gradeLevelId: ID, attributes: JSON, active: Boolean): Student
    deleteStudent(id: ID!): Boolean
    importStudents(schoolId: ID!, gradeLevelId: ID!, data: JSON!): [Student]

    # Class mutations
    createClass(schoolId: ID!, gradeLevelId: ID!, name: String!, teacherId: ID): Class
    updateClass(id: ID!, name: String, teacherId: ID): Class
    deleteClass(id: ID!): Boolean
    assignStudentToClass(studentId: ID!, classId: ID!): Student
    removeStudentFromClass(studentId: ID!): Student

    # ClassList mutations
    createClassList(schoolId: ID!, gradeLevelId: ID!, name: String!, schoolYear: String!): ClassList
    updateClassList(id: ID!, name: String, status: String): ClassList
    deleteClassList(id: ID!): Boolean
    generateClassList(classListId: ID!, numClasses: Int!, options: JSON): ClassList
    optimizeClassList(classListId: ID!, options: JSON): ClassList

    # TeacherSurvey mutations
    createTeacherSurvey(schoolId: ID!, gradeLevelId: ID!, title: String!, description: String, questions: JSON!): TeacherSurvey
    updateTeacherSurvey(id: ID!, title: String, description: String, questions: JSON, status: String): TeacherSurvey
    deleteTeacherSurvey(id: ID!): Boolean
    submitTeacherSurveyResponse(surveyId: ID!, teacherId: ID!, answers: JSON!): TeacherSurveyResponse

    # ParentRequest mutations
    createParentRequest(studentId: ID!, requestType: String!, requestDetails: String!): ParentRequest
    updateParentRequest(id: ID!, requestType: String, requestDetails: String, status: String): ParentRequest
    deleteParentRequest(id: ID!): Boolean
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }
`;

module.exports = typeDefs; 