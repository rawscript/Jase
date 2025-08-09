#!/bin/bash

echo "🚀 Deploying backend to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Backend deployment complete!"
echo "Don't forget to:"
echo "1. Set environment variables in Vercel dashboard:"
echo "   - DATABASE_URL"
echo "   - NODE_ENV=production"
echo "   - EMAIL_USER (if using email features)"
echo "   - EMAIL_PASS (if using email features)"
echo "2. Update VITE_API_URL in client/.env.production with your Vercel URL"