exports.handler = async function(event, context) {
  try {
    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'OK', message: 'Backend is healthy (from functions/health.js)' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For production, consider specific origins like 'http://localhost:5000', 'https://your-firebase-app-id.web.app'
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With'
      }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'Error', message: 'Backend health check failed', error: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // For production, consider specific origins like 'http://localhost:5000', 'https://your-firebase-app-id.web.app'
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With'
      }
    };
  }
};
