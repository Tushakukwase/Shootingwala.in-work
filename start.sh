#!/bin/bash

# Shootingwala.in Start Script for Shared Hosting

# Set environment variables
export NODE_ENV=production

# Check if Node.js is available
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null
then
    echo "npm is not installed or not in PATH"
    exit 1
fi

# Install production dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing production dependencies..."
    npm install --production
fi

# Check if build exists
if [ ! -d ".next" ]; then
    echo "Build directory not found. Building the application..."
    npm run build
fi

# Start the application
echo "Starting Shootingwala.in application..."
npm run start