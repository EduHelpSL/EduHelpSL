exports.handler = async function(event, context) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY; // Example, ensure this env var is set in Netlify

  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY environment variable is not set in Netlify build settings.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key for Gemini is not configured on the server.' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Consider restricting this in production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }

  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        geminiApiKey: geminiApiKey,
        googleDriveApiKey: googleDriveApiKey
        // Add other keys as needed
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Consider restricting this in production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  } catch (error) {
    console.error('Error in getKeys function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve API keys.', details: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }
};
