#!/bin/bash

# Portfolio Website Setup Script
# This script helps set up the portfolio website outside of Replit

echo "🚀 Setting up Portfolio Website..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env file with your database connection string"
    echo "   For Supabase: Get your connection string from Supabase Dashboard > Connect > Transaction pooler"
fi

# Check if DATABASE_URL is set
if [ -f ".env" ]; then
    if grep -q "DATABASE_URL=postgresql://" .env; then
        echo "✅ DATABASE_URL found in .env file"
        
        # Ask if user wants to push database schema
        echo "🗄️  Do you want to push the database schema? (y/n)"
        read -r response
        if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
            echo "🔧 Pushing database schema..."
            npm run db:push
        fi
    else
        echo "⚠️  Please set your DATABASE_URL in the .env file"
        echo "   Example: DATABASE_URL=postgresql://user:password@localhost:5432/database"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "📚 Check README.md for more information"