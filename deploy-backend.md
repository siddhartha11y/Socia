# Backend Deployment Guide

## Current Setup
- Backend deployed on Render: https://socia-back.onrender.com
- Frontend running locally for testing

## Common Issues & Solutions

### 1. Images Disappearing After 5 Minutes
**Cause**: JWT token expiration (7 days) + authentication issues
**Solution**: 
- ✅ Added token monitoring in frontend
- ✅ Updated CORS configuration
- ✅ Added better error handling for image loading

### 2. Blank Story Pages
**Cause**: Missing utility functions + image loading errors
**Solution**:
- ✅ Added missing formatTime function
- ✅ Improved error handling in StoryViewer
- ✅ Added fallback images for profile pictures

### 3. Static File Serving Issues
**Current**: Images served from `/images` endpoint
**Path**: `public/images/` folder in backend
**URL**: `https://socia-back.onrender.com/images/stories/filename.jpg`

## Environment Variables to Check

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
PORT=5000
NODE_ENV=production
JWT_SECRET=modernmountainsarebuildbycoderskeepbuilding
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://socia-back.onrender.com
```

## Deployment Commands

### Backend (Render)
- Auto-deploys from Git repository
- Build command: `npm install`
- Start command: `npm start`

### Frontend (Local Testing)
```bash
cd frontend
npm run dev
```

### Frontend (Production Build)
```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting Steps

1. **Check Render logs** for backend errors
2. **Verify environment variables** are set correctly
3. **Test API endpoints** directly:
   - GET https://socia-back.onrender.com/api/stories
   - GET https://socia-back.onrender.com/api/auth/me
4. **Check browser console** for frontend errors
5. **Verify image URLs** are accessible:
   - https://socia-back.onrender.com/images/stories/[filename]

## Recent Fixes Applied

1. ✅ Updated CORS to include backend URL
2. ✅ Added token expiration monitoring
3. ✅ Fixed missing utility functions
4. ✅ Improved error handling for images
5. ✅ Added fallback profile pictures
6. ✅ Enhanced axios interceptors

## Next Steps for Full Deployment

1. Deploy frontend to Vercel/Netlify
2. Update CORS to include frontend URL
3. Set up proper CDN for images
4. Add image optimization
5. Set up monitoring and logging