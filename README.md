# Class Harmony

> Balanced Classes, Brighter Futures

Class Harmony is a cloud-based SaaS product designed to help K-12 schools create balanced and fair class lists quickly and efficiently. It automates the class placement process by considering academic performance, behavior, social dynamics, and other key factors, while allowing for manual adjustments and real-time collaboration.

## Project Overview

The Class Harmony platform uses a modern tech stack to provide schools with powerful tools for creating optimal class placements:

- **Frontend**: React.js with Material-UI for a responsive, intuitive user interface
- **Backend**: API service built with Express.js/Node.js (to be migrated to Elixir in future phases)
- **Database**: PostgreSQL for relational data storage
- **API**: GraphQL for efficient and flexible data queries
- **Real-time**: WebSocket integration for live collaboration

## Key Features

- **Data Import and Setup**: Support for CSV, Excel, and SIS integrations
- **Teacher Surveys**: Customizable surveys for gathering input
- **Parent Requests**: Portal for parents to submit placement considerations
- **Class Optimization Algorithm**: Advanced balancing across multiple factors
- **Manual Adjustments**: Drag-and-drop interface with real-time feedback
- **Reporting and Analytics**: Visual reports and export options
- **Collaboration Tools**: Real-time editing with role-based access
- **AI-Powered Suggestions**: Machine learning for optimal student groupings
- **Parent Portal**: Secure access for parents to view placements
- **Mobile Accessibility**: Responsive design for all devices

## Project Structure

```
class-harmony/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   ├── src/                 # React source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service integrations
│   │   ├── contexts/        # React contexts for state management
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
├── server/                  # Backend application
│   ├── src/                 # Server source code
│   │   ├── api/             # API routes and controllers
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic services
│   │   ├── utils/           # Utility functions
│   │   └── middleware/      # Express middleware
│   └── scripts/             # Database and server scripts
├── docs/                    # Documentation
└── terraform/               # Infrastructure as code (for AWS/Azure deployment)
```

## Deployment

### Prerequisites

- Docker and Docker Compose installed
- Git for cloning the repository
- Node.js v18+ (for local development only)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/class-harmony.git
   cd class-harmony
   ```

2. Create environment variables file:
   ```bash
   cp .env.example .env
   ```

3. Modify the `.env` file with your specific configuration values:
   - Set secure database credentials
   - Configure JWT secret key
   - Set up email service credentials
   - Adjust client URL if needed

### Deployment with Docker Compose

Deploy the entire application stack (MongoDB, backend, and frontend) with Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (will delete database data)
docker-compose down -v
```

### Manual Deployment (Development)

For development or running components separately:

#### Backend (Server)

```bash
cd server
npm install
npm run dev  # For development with hot reload
# OR
npm start    # For production
```

#### Frontend (Client)

```bash
cd client
npm install
npm start    # For development
# OR
npm run build  # For production build
```

### Production Considerations

For production deployments, consider the following:

1. **SSL/TLS**: Configure HTTPS with a valid SSL certificate
2. **Database Backups**: Set up regular MongoDB backups
3. **Monitoring**: Implement monitoring and alerting
4. **Scaling**: Consider container orchestration for larger deployments
5. **CI/CD**: Set up continuous integration/deployment pipelines

### Cloud Deployment Options

The application can be deployed to various cloud providers:

1. **AWS**:
   - EC2 instances with Docker
   - ECS for container orchestration
   - MongoDB Atlas or DocumentDB

2. **Azure**:
   - Azure App Service
   - Azure Container Instances
   - CosmosDB for MongoDB

3. **Google Cloud**:
   - Google Compute Engine
   - Google Kubernetes Engine
   - MongoDB Atlas

### Troubleshooting

Common issues and solutions:

1. **Database Connection Errors**:
   - Check MongoDB credentials in `.env` file
   - Ensure MongoDB container is running (`docker-compose ps`)
   - Verify network connectivity between containers

2. **API Connection Issues**:
   - Check that backend is running and healthy
   - Verify API URL in frontend configuration
   - Check network/firewall settings

3. **Frontend Build Failures**:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## Development Phases

1. **Phase 1 (MVP)**: Data import, teacher surveys, optimization, adjustments, reporting
2. **Phase 2**: AI suggestions, parent portal, collaboration tools
3. **Phase 3**: SIS integrations, large district scaling, user management
4. **Phase 4**: Mobile app, global expansion

## Recent Updates & Progress

### Phase 1: Foundation & Core Features
- ✅ Set up React application structure
- ✅ Created authentication system
- ✅ Implemented basic page layouts and navigation
- ✅ Created Student Import functionality with multi-step wizard
- ✅ Implemented Class Lists page with drag-and-drop functionality

### Phase 2: Data Management & User Experience
- ✅ Created simulated API service layer with localStorage persistence
- ✅ Implemented comprehensive state management with context API
- ✅ Connected UI components to the data layer for realistic user experience
- ✅ Added Teacher Survey module for collecting teaching preferences and student compatibility data
- ✅ Enhanced dashboard with real-time data visualization
- ✅ Implemented class optimization algorithm prototype

### Phase 3: User Management & Access Control

In this phase, we focused on implementing a comprehensive user management system with role-based access control:

- **User Management Interface:**
  - Created an administrative interface for managing users across different roles
  - Implemented functionality to add, update, delete, and invite users
  - Added user status management (active/inactive)
  
- **Role-Based Access Control:**
  - Implemented permission-based routing for different user roles
  - Created separate admin-only section in the navigation menu
  - Restricted access to administrative features

- **Enhanced Data Layer:**
  - Updated API service with user management endpoints
  - Added school management capabilities
  - Enhanced data context with user management methods

### Phase 4: User Experience & System Configuration

In this phase, we expanded the application's functionality with personalized user profiles and administrative settings:

- **Profile Management:**
  - Created a comprehensive Profile page for users to manage personal information
  - Implemented password change functionality with security requirements
  - Added notification preferences management
  - Designed user profile with visual indicators and intuitive organization

- **System Settings:**
  - Developed a Settings page for administrative configuration
  - Implemented sections for general settings, notification settings, and data retention policies
  - Created email configuration tools for system notifications
  - Added class balance algorithm configuration options
  - Designed security settings for organizational policies

- **Notification System:**
  - Enhanced notification system with preference management
  - Implemented real-time notifications for system events
  - Created visual notifications with read/unread state
  - Added notification management interface in the application header

### Phase 5: Multi-tenant Architecture

In this phase, we implemented a comprehensive School Management system to support multi-tenancy:

- **School Management Interface:**
  - Created an administrative interface for managing schools and their properties
  - Implemented a complete CRUD system for school entities
  - Added a visual dashboard for schools grouped by location
  - Designed detailed school profile views with comprehensive information
  
- **District Support:**
  - Added district management capabilities
  - Implemented relationships between schools and districts
  - Created mock data for districts and schools for demonstration
  
- **Enhanced Data Architecture:**
  - Updated the data context to support multi-school operations
  - Implemented school-specific data filtering
  - Enhanced the API service layer to handle school-related operations

### Next Steps

- **Implement School Management:**
  - Create a school management interface for administrators
  - Add multi-tenant capabilities to support multiple schools
  
- **Develop Email Notification System:**
  - Implement email notifications for important events
  - Add support for user invitations via email
  
- **Enhance Reporting Capabilities:**
  - Add PDF export for reports
  - Create comparative reports across school years
  - Implement additional visualization options

- **Data Export/Import:**
  - Create export functionality for all data types
  - Enhance import capabilities for bulk operations
  
- **Mobile Optimizations:**
  - Improve responsive design for mobile usage
  - Optimize critical workflows for mobile users

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (v13+)
- Docker (optional, for containerized development)

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd class-harmony
```