# Admin Panel Guide

## Overview
The admin panel now includes two main sections for managing digital content:

1. **Digital Album** - Manage album covers, titles, and descriptions
2. **Digital Invitation** - Manage event invitations with details like date, location, and background images

## Features

### Digital Album Section
- Upload album cover images
- Set album title
- Add album description
- Live preview of how the album will appear
- Save functionality with API integration

### Digital Invitation Section
- Upload invitation background images
- Set event title
- Add event date and time
- Set event location
- Add additional event details
- Live preview showing invitation layout
- Save functionality with API integration

## How to Use

### Accessing the Admin Panel
1. Navigate to `/admin` in your browser
2. You'll see two tabs: "Digital Album" and "Digital Invitation"

### Managing Digital Albums
1. Click on the "Digital Album" tab
2. Upload an album cover image (recommended size: 800×800)
3. Enter the album title
4. Add a description for the album
5. Preview your changes in real-time on the right panel
6. Click "Save Album" to save your changes

### Managing Digital Invitations
1. Click on the "Digital Invitation" tab
2. Upload a background image (recommended size: 1080×1920)
3. Enter the event title
4. Add event date and time
5. Set the event location
6. Add any additional details
7. Preview your invitation in real-time on the right panel
8. Click "Save Invitation" to save your changes

### Viewing on Main Page
- The saved content will automatically appear on the main homepage
- The "Other Services" section will display your digital album and invitation content
- Images, titles, and descriptions will be pulled from your admin panel settings

## API Endpoints

### Digital Album
- `GET /api/digital-album` - Retrieve current album data
- `POST /api/digital-album` - Save album data

### Digital Invitation
- `GET /api/digital-invitation` - Retrieve current invitation data
- `POST /api/digital-invitation` - Save invitation data

## File Structure
```
components/admin/
├── digital-album-manager.tsx      # Album management component
├── digital-invitation-manager.tsx # Invitation management component
├── album-preview.tsx              # Album preview component
└── invitation-preview.tsx         # Invitation preview component

app/
├── admin/page.tsx                 # Main admin page
├── api/digital-album/route.ts     # Album API endpoint
└── api/digital-invitation/route.ts # Invitation API endpoint
```

## Notes
- All data is currently stored in memory for demo purposes
- In production, you should integrate with a proper database
- Images are stored as base64 data URLs
- The admin panel uses the same design theme as the rest of the application
- Real-time previews update as you type or upload images