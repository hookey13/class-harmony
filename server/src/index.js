require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const logger = require('./utils/logger');
const db = require('./models');
const port = process.env.PORT || 5000;

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const apiRoutes = require('./api/routes');

// API routes
app.use('/api', apiRoutes);

// GraphQL server setup
async function startApolloServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql', cors: false });
  
  return apolloServer;
}

// Create HTTP server
const httpServer = createServer(app);

// Set up Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);
  
  // Handle class list collaboration
  socket.on('join-class-list', (classListId) => {
    socket.join(`class-list-${classListId}`);
    logger.info(`Client ${socket.id} joined class list ${classListId}`);
  });
  
  socket.on('leave-class-list', (classListId) => {
    socket.leave(`class-list-${classListId}`);
    logger.info(`Client ${socket.id} left class list ${classListId}`);
  });
  
  socket.on('student-moved', (data) => {
    socket.to(`class-list-${data.classListId}`).emit('student-moved', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
  });
});

// Start the server
async function startServer() {
  try {
    // Connect to database
    await db.sequelize.authenticate();
    logger.info('Database connection established successfully.');
    
    // Sync database models in development
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('Database models synchronized.');
    }
    
    // Start Apollo Server
    const apolloServer = await startApolloServer();
    logger.info(`GraphQL endpoint ready at: http://localhost:${port}${apolloServer.graphqlPath}`);
    
    // Start HTTP server
    httpServer.listen(port, () => {
      logger.info(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 