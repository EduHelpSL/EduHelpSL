# Netlify Functions Migration Guide

This guide explains how to migrate your Express backend from Firebase Functions to Netlify Functions while keeping your frontend hosted on Firebase.

## 🏗️ Architecture Overview

- **Frontend**: Remains hosted on Firebase Hosting
- **Backend**: Migrated to Netlify Functions
- **API Communication**: Frontend calls Netlify Functions via CORS-enabled requests

## 📁 Project Structure

```
EduHelpSL/
├── netlify/
│   └── functions/
│       ├── api.js              # Main Netlify Function entry point
│       └── package.json        # Dependencies for Netlify Functions
├── netlify.toml                # Netlify configuration
├── public/                     # Frontend files (stays on Firebase)
├── functions/                  # Original Firebase Functions (can be removed after migration)
└── firebase.json               # Firebase configuration (frontend only)
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
# Navigate to the Netlify Functions directory
cd netlify/functions

# Install dependencies
npm install

# Install Netlify CLI globally for local development
npm install -g netlify-cli
```

### 2. Local Development Setup

```bash
# From the project root directory
netlify dev
```

This will:

- Start the Netlify Functions emulator
- Serve your functions at `http://localhost:8888/.netlify/functions/api`
- Enable live reloading for function changes

### 3. Environment Variables Configuration

Set up environment variables in Netlify:

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Add the following variables:

```
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GEMINI_API_KEY_3=your_gemini_api_key_3
GDRIVE_API_KEY=your_google_drive_api_key
GDRIVE_FOLDER_ID=your_google_drive_folder_id
NODE_ENV=production
```

### 4. Frontend Configuration Update

Update your frontend API service to point to the Netlify Functions:

```javascript
// In public/js/apiService.js, update the API_BASE_URL
const API_BASE_URL = "https://your-netlify-site.netlify.app/api";

// For local development, you can use:
// const API_BASE_URL = "http://localhost:8888/api";
```

## 🌐 Deployment

### Automated Deployment
```bash
# Use the automated deployment script
npm run netlify:deploy

# Or deploy backend only
npm run deploy:backend

# Or deploy frontend only
npm run deploy:frontend
```

### Manual Deployment

1. **Connect your repository to Netlify:**

   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "New site from Git"
   - Connect your GitHub/GitLab repository

2. **Configure build settings:**

   - Build command: `echo 'Frontend hosted on Firebase'`
   - Publish directory: `public`
   - Functions directory: `netlify/functions`

3. **Deploy:**
   ```bash
   # Install Netlify CLI globally (if not already installed)
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy your site
   netlify deploy --prod
   ```

### Update Firebase Frontend

1. **Update API endpoints in your frontend:**

   ```javascript
   // Replace Firebase Functions URL with Netlify Functions URL
   const API_BASE_URL = "https://your-netlify-site.netlify.app/api";
   ```

2. **Deploy updated frontend to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

## 🔧 Testing

### Automated Testing

```bash
# Test local development server
npm run test:local

# Test production deployment (provide your Netlify URL)
npm run test:prod https://your-netlify-site.netlify.app

# General test command
npm test
```

### Manual Testing

```bash
# Start local development server
npm run dev
# or
netlify dev

# Test endpoints manually
curl http://localhost:8888/api/health
curl http://localhost:8888/api/keys
```

### Production Testing

```bash
# After deployment, test your live endpoints
curl https://your-netlify-site.netlify.app/api/health
curl https://your-netlify-site.netlify.app/api/keys
```

## 🔒 Security Considerations

1. **CORS Configuration**: The Netlify Function includes CORS headers to allow requests from your Firebase domain
2. **Environment Variables**: API keys are stored securely in Netlify environment variables
3. **HTTPS**: All communication uses HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**

   - Ensure your Firebase domain is added to the CORS origins in `api.js`
   - Check that CORS headers are properly configured

2. **Function Not Found:**

   - Verify the `netlify.toml` redirect rules
   - Check that the function is deployed correctly

3. **Environment Variables:**
   - Ensure all required environment variables are set in Netlify
   - Check variable names match exactly

### Debug Mode

Enable debug logging by setting:

```
NODE_ENV=development
DEBUG=*
```

## 📊 Performance Considerations

1. **Cold Starts**: Netlify Functions may have cold start delays
2. **Caching**: Implement appropriate caching strategies
3. **Connection Pooling**: For database connections, use connection pooling

## 🔄 Migration Checklist

- [ ] Netlify Functions created and tested locally
- [ ] Environment variables configured in Netlify
- [ ] CORS properly configured for Firebase domain
- [ ] Frontend updated to use Netlify API endpoints
- [ ] All API endpoints tested
- [ ] Firebase Functions disabled/removed
- [ ] Documentation updated

## 📞 Support

If you encounter issues during migration:

1. Check the Netlify Functions logs in your dashboard
2. Test endpoints locally using `netlify dev`
3. Verify environment variables are properly set
4. Ensure CORS configuration matches your Firebase domain

## 🎯 Next Steps

After successful migration:

1. Monitor function performance and cold starts
2. Implement proper error handling and logging
3. Set up monitoring and alerts
4. Consider implementing API rate limiting
5. Remove old Firebase Functions code