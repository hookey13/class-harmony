// Simple health check endpoint
module.exports = (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Health check endpoint is working!',
    timestamp: new Date().toISOString()
  });
};
