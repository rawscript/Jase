# External Services Setup Guide

This guide explains how to obtain credentials for the external services required for the portfolio enhancements.

## Table of Contents
1. [Gmail API Credentials](#gmail-api-credentials)
2. [Map Service Tokens](#map-service-tokens)
3. [LLM API Keys](#llm-api-keys)
4. [Environment Configuration](#environment-configuration)
5. [Verification Steps](#verification-steps)

## Gmail API Credentials

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select existing project
3. Name: `portfolio-contact-form`
4. Location: Organization or no organization

### Step 2: Enable Gmail API
1. Navigate to **APIs & Services > Library**
2. Search for "Gmail API"
3. Click "Enable"

### Step 3: Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. User Type: **External** (for testing) or **Internal** (for G Suite)
3. Fill required fields:
   - App name: `Portfolio Contact Form`
   - User support email: `jasemwaura@gmail.com`
   - Developer contact email: `jasemwaura@gmail.com`
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send` (Send emails only)
   - `https://www.googleapis.com/auth/userinfo.email` (View email address)
5. Add test users: `jasemwaura@gmail.com`
6. Save and continue through all steps

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services > Credentials**
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Application type: **Web application**
4. Name: `Portfolio Web Client`
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (React dev server)
   - Your production domain (e.g., `https://yourportfolio.com`)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/callback/google` (development)
   - `https://your-api-server.com/api/auth/callback/google` (production)
7. Click "Create"
8. Download the credentials or copy:
   - **Client ID**: `your_gmail_client_id_here.apps.googleusercontent.com`
   - **Client Secret**: `your_gmail_client_secret_here`

### Step 5: Generate Refresh Token
1. Run the OAuth flow once in development:
   ```bash
   # The app will provide an OAuth URL when you first try to send an email
   # Visit the URL, authorize the app, and get the authorization code
   # The app will exchange it for refresh/access tokens automatically
   ```
2. Alternative manual method:
   ```bash
   curl --location --request POST 'https://oauth2.googleapis.com/token' \
   --header 'Content-Type: application/x-www-form-urlencoded' \
   --data-urlencode 'client_id=YOUR_CLIENT_ID' \
   --data-urlencode 'client_secret=YOUR_CLIENT_SECRET' \
   --data-urlencode 'grant_type=authorization_code' \
   --data-urlencode 'code=YOUR_AUTHORIZATION_CODE' \
   --data-urlencode 'redirect_uri=http://localhost:5000/api/auth/callback/google'
   ```

## Map Service Tokens

### Option A: Mapbox GL JS (Recommended)
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in
3. Navigate to **Account > Access tokens**
4. Create a new token:
   - Name: `portfolio-map`
   - Token scopes: Check all `public` scopes
   - URL restrictions: Your portfolio domain(s)
   - Click "Create token"
5. Copy the token for `MAPBOX_ACCESS_TOKEN`

### Option B: Leaflet (Open Source, No Token)
1. No token required
2. Uses OpenStreetMap tiles (free, no authentication)
3. Set `USE_LEAFLET=true` in .env
4. Update client-side config to use Leaflet

### Performance Comparison
- **Mapbox**: Better performance, vector tiles, 3D terrain, requires token (free tier: 50k loads/month)
- **Leaflet**: Open source, simpler, raster tiles, no token required, may have slower performance

## LLM API Keys

### Option A: OpenAI GPT-4
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API keys**
4. Click "Create new secret key"
5. Name: `portfolio-conversation`
6. Copy the key immediately (won't be shown again)
7. Set in .env as `OPENAI_API_KEY`

**Cost Considerations**: GPT-4 is more expensive than GPT-3.5. Consider starting with `gpt-3.5-turbo` for development.

### Option B: Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click "Create Key"
5. Name: `portfolio-conversation`
6. Copy the key
7. Set in .env as `ANTHROPIC_API_KEY`

**Model Options**:
- `claude-3-opus-20240229`: Most capable, most expensive
- `claude-3-sonnet-20240229`: Balanced
- `claude-3-haiku-20240229`: Fastest, least expensive

### Cost Management Tips
1. Start with free credits if available
2. Set usage limits in your account
3. Implement caching to reduce API calls
4. Use lower-temperature settings for consistency
5. Monitor usage in provider dashboard

## Environment Configuration

### Development Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update `.env` with your credentials
3. For client-side, also update `client/.env.local` or `client/.env.production`

### Production Setup
1. Use environment variables on your hosting platform:
   - **Vercel**: Project Settings > Environment Variables
   - **Netlify**: Site Settings > Environment Variables
   - **AWS Amplify**: App Settings > Environment Variables
   - **Railway**: Environment Variables section
2. Never commit `.env` files to version control
3. Use different credentials for development and production

### Security Best Practices
1. Rotate credentials regularly
2. Use least-privilege scopes (especially for Gmail API)
3. Set up monitoring for unusual API usage
4. Use secret management services for production
5. Never expose API keys in client-side code

## Verification Steps

### Step 1: Check Environment Loading
```bash
# Test server environment
cd api
npm run dev
# Check console for environment variable warnings

# Test client environment
cd client
npm run dev
# Check browser console for environment variable errors
```

### Step 2: Test Gmail Configuration
```bash
# Run the Gmail service test
cd api
npm test -- services/gmail.service.test.ts
```

### Step 3: Test Map Configuration
1. Start the development server
2. Navigate to the map page
3. Check browser console for map initialization errors
4. Verify map loads with correct viewport

### Step 4: Test LLM Configuration
```bash
# Run the LLM service test
cd api
npm test -- services/llm.service.test.ts

# Or test manually
curl -X POST http://localhost:5000/api/test/llm \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Step 5: Complete Integration Test
1. Start both server and client
2. Test contact form submission
3. Test map interaction
4. Test conversation flow
5. Verify all features work together

## Troubleshooting

### Common Issues

#### Gmail API: "Invalid Grant"
- Refresh token expired or invalid
- Solution: Re-run OAuth flow to get new refresh token

#### Mapbox: "Invalid Token"
- Token expired or restricted
- Solution: Generate new token in Mapbox account

#### OpenAI: "Invalid API Key"
- Key incorrect or expired
- Solution: Generate new key in OpenAI dashboard

#### CORS Errors
- Client trying to access API from different origin
- Solution: Verify `CORS_ORIGIN` includes client URL

#### Environment Variables Not Loading
- Variables not set in current shell
- Solution: Restart terminal or use `source .env` (not recommended for production)

### Debug Mode
Enable debug logging in `.env`:
```env
DEBUG_GMAIL=true
DEBUG_MAP=true
DEBUG_LLM=true
DEBUG_API=true
```

Check server logs for detailed error information.

## Support

For issues with:
- **Gmail API**: [Google Cloud Support](https://cloud.google.com/support)
- **Mapbox**: [Mapbox Support](https://docs.mapbox.com/help/)
- **OpenAI**: [OpenAI Help](https://help.openai.com/)
- **Anthropic**: [Anthropic Documentation](https://docs.anthropic.com/)

For application issues, check server logs and browser console for error messages.