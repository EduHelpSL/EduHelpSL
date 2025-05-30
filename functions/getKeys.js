const allowedOrigins = [
  'https://eduhelp-sl.web.app',
  'http://localhost:5001'
];

exports.handler = async function(event, context) {
  const geminiApiKey1 = process.env.GEMINI_API_KEY_1;
  const geminiApiKey2 = process.env.GEMINI_API_KEY_2;
  const geminiApiKey3 = process.env.GEMINI_API_KEY_3;
  const googleDriveApiKey = process.env.GOOGLE_DRIVE_API_KEY;
  const googleDriveFolderId = process.env.GDRIVE_FOLDER_ID;

  if (!geminiApiKey1 || !geminiApiKey2) {
    console.error('One or both GEMINI_API_KEY_1 or GEMINI_API_KEY_2 environment variables are not set in Netlify build settings.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Required Gemini API keys are not configured on the server.' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigins.includes(event.headers.origin) ? event.headers.origin : allowedOrigins[0],
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With'
      }
    };
  }

  try {
    return {
      statusCode: 200,
      body: JSON.stringify({
        geminiApiKey1: geminiApiKey1,
        geminiApiKey2: geminiApiKey2,
        geminiApiKey3: geminiApiKey3,
        googleDriveApiKey: googleDriveApiKey,
        googleDriveFolderId: googleDriveFolderId
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigins.includes(event.headers.origin) ? event.headers.origin : allowedOrigins[0],
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With'
      }
    };
  } catch (error) {
    console.error('Error in getKeys function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to retrieve API keys.', details: error.message }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigins.includes(event.headers.origin) ? event.headers.origin : allowedOrigins[0],
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, User-Agent, X-Requested-With'
      }
    };
  }
};
