# Deployment Guide for Shared Hosting

This guide explains how to deploy the Shootingwala.in project on shared hosting environments. The project is built with Next.js and requires specific configurations for successful deployment.

## Prerequisites

1. Shared hosting account with Node.js support (version 18 or higher)
2. MongoDB database (MongoDB Atlas recommended for shared hosting)
3. SSH access to your hosting account (if required)
4. Domain name configured for your hosting account

## Deployment Steps

### 1. Prepare the Application

Before deployment, ensure you have:

1. Updated the `.env.local` file with your production MongoDB connection string
2. Set the correct `ADMIN_EMAIL` in the `.env.local` file
3. Built the application using `npm run build`

### 2. Build the Application

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

### 3. Configure for Shared Hosting

#### Environment Variables
Create a `.env.production` file with your production settings:

```env
# MongoDB Connection (replace with your actual MongoDB URI)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/photobook?retryWrites=true&w=majority

# Admin Email (replace with your admin email)
ADMIN_EMAIL=your-admin-email@example.com

# Node Environment
NODE_ENV=production
```

#### Next.js Configuration
The project is already configured for production deployment. The `next.config.mjs` file includes optimizations for:
- Image optimization
- Performance enhancements
- Compression

### 4. Upload Files to Shared Hosting

Upload the following files and directories to your shared hosting account:

1. `.next/` - Built application files
2. `public/` - Static assets
3. `package.json` - Dependencies
4. `.env.production` - Environment variables
5. `next.config.mjs` - Next.js configuration

### 5. Install Dependencies on Server

If your hosting provider allows running npm commands:

```bash
npm install --production
```

### 6. Start the Application

Most shared hosting providers use a process manager. Create a `start.sh` script:

```bash
#!/bin/bash
export NODE_ENV=production
npm run start
```

Or follow your hosting provider's specific instructions for starting Node.js applications.

## Shared Hosting Specific Considerations

### File System Limitations
- Shared hosting often has limited disk space and file count limits
- The project has been cleaned to remove unnecessary files (see cleanup documentation)
- Avoid storing large files locally; use cloud storage services

### Memory and CPU Limitations
- Shared hosting typically has limited memory and CPU resources
- The application uses connection pooling for MongoDB to minimize resource usage
- Image optimization is enabled to reduce bandwidth usage

### Database Considerations
- Use MongoDB Atlas or similar cloud database service
- The application is configured with connection pooling and retry logic
- Ensure your MongoDB connection string includes the correct database name

### Security Considerations
- Never commit sensitive information like database passwords to version control
- Use environment variables for all sensitive configuration
- The application includes middleware for route protection

## Common Issues and Solutions

### 1. Build Failures
If you encounter build failures:
- Ensure Node.js version is 18 or higher
- Check that all dependencies are correctly installed
- Verify environment variables are properly set

### 2. Database Connection Issues
- Verify MongoDB URI is correct
- Check that your IP is whitelisted in MongoDB Atlas
- Ensure the database user has proper permissions

### 3. Performance Issues
- Enable caching in your hosting environment
- Use CDN for static assets
- Monitor resource usage and upgrade hosting plan if necessary

## Support

For deployment issues, contact your hosting provider's support team with:
- Error messages from the application logs
- Details about your hosting environment
- Steps you've already taken to resolve the issue

## Maintenance

Regular maintenance tasks:
- Monitor application logs for errors
- Update dependencies periodically
- Backup your MongoDB database
- Monitor resource usage