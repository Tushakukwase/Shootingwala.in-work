# Admin Photographer Content Management

## Overview
Added comprehensive admin management for photographer galleries and stories with homepage feature request handling.

## New Admin Components

### 1. Photographer Galleries Manager
**Location**: `components/admin/photographer-galleries-manager.tsx`
**Admin Menu**: "Photographer Galleries"

#### Features:
- **View All Galleries**: Complete list of all photographer galleries
- **Homepage Feature Requests**: Dedicated section for pending homepage requests
- **Gallery Management**: 
  - View gallery details with image previews
  - Toggle homepage display with checkbox
  - Delete galleries (admin only)
- **Search & Filter**: Search by gallery name or photographer name
- **Stats Dashboard**: Total galleries, featured count, pending requests

#### UI Similar to City Suggestions:
- Card-based layout with image thumbnails
- Status badges (Featured/Published)
- Action buttons (View, Delete)
- Homepage checkbox toggle
- Pending requests section with approve/reject buttons

### 2. Photographer Stories Manager
**Location**: `components/admin/photographer-stories-manager.tsx`
**Admin Menu**: "Photographer Stories"

#### Features:
- **View All Stories**: Complete list of all photographer stories
- **Homepage Feature Requests**: Dedicated section for pending homepage requests
- **Story Management**:
  - View story details with cover image
  - Toggle homepage display with checkbox
  - Delete stories (admin only)
- **Search & Filter**: Search by title, content, photographer, or location
- **Stats Dashboard**: Total stories, featured count, pending requests

#### UI Similar to City Suggestions:
- Card-based layout with cover images
- Status badges (Featured/Published)
- Action buttons (View, Delete)
- Homepage checkbox toggle
- Pending requests section with approve/reject buttons

## Admin Workflow

### Homepage Feature Request Process:
1. **Photographer Request**: Photographer clicks "Request Homepage Feature" button
2. **Notification Created**: System creates notification for admin
3. **Admin Review**: Admin sees pending request in dedicated section
4. **Admin Action**: Admin can approve or reject the request
5. **Status Update**: Content is featured on homepage if approved

### Admin Capabilities:
- **Full Control**: Admin can delete any photographer content
- **Homepage Management**: Admin controls what appears on homepage
- **Direct Toggle**: Admin can directly toggle homepage display without requests
- **Bulk Operations**: View and manage all content in one place

## Integration with Existing System

### Notifications:
- Homepage requests create notifications with `actionRequired: true`
- Notifications are marked as resolved when admin takes action
- Badge counts show pending requests in admin menu

### API Endpoints Used:
- `GET /api/photographer-galleries` - Fetch all galleries
- `PUT /api/photographer-galleries` - Update gallery (homepage toggle, delete)
- `GET /api/photographer-stories` - Fetch all stories  
- `PUT /api/photographer-stories` - Update story (homepage toggle, delete)
- `GET /api/notifications` - Fetch homepage requests
- `PUT /api/notifications` - Mark requests as resolved

### Data Flow:
1. Photographer creates content → Auto-published
2. Photographer requests homepage feature → Notification created
3. Admin reviews request → Approves/rejects
4. Content appears on homepage if approved

## Benefits

### For Admins:
- **Centralized Management**: All photographer content in one place
- **Quality Control**: Review content before homepage featuring
- **Easy Moderation**: Delete inappropriate content
- **Clear Workflow**: Dedicated sections for pending requests

### For Photographers:
- **Immediate Publishing**: Content goes live immediately
- **Simple Requests**: One-click homepage feature requests
- **Transparency**: Clear status of homepage requests

### For Users:
- **More Content**: All photographer content available immediately
- **Quality Homepage**: Only admin-approved content on homepage
- **Better Discovery**: More content to browse in photographer profiles

## UI Design Consistency
Both components follow the same design pattern as the city suggestions manager:
- Stats cards at the top
- Pending requests section (highlighted in yellow)
- Search and filter controls
- Card-based content list
- Action buttons and checkboxes
- Modal dialogs for detailed views
- Consistent color scheme and spacing