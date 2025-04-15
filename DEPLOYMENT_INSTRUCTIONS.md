# CoffeeCompass Deployment Instructions

This document contains detailed deployment instructions for both Netlify and Render.

## Netlify Deployment

### Step 1: Prepare Your GitHub Repository

1. Push your code to a GitHub repository (if you haven't already)
2. Make sure the repository includes all the code and configuration files

### Step 2: Sign up/Log in to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign up or log in
2. Click "New site from Git" or "Import an existing project"
3. Select GitHub as your Git provider and authorize Netlify
4. Select your CoffeeCompass repository

### Step 3: Configure Build Settings

Enter these *exact* settings when prompted:

- **Branch to deploy**: `main` (or your main branch name)
- **Base directory**: *(leave empty)*
- **Build command**: `npm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions` (if you have serverless functions)

### Step 4: Environment Variables

1. Go to Site settings > Environment variables after deployment
2. Add the following environment variable:
   - Key: `GOOGLE_MAPS_API_KEY`
   - Value: `AIzaSyB7k9OzFNfair6vp-EDCVaBilH_DL4ebM8`

### Step 5: Deploy

1. Click "Deploy site"
2. Wait for the initial build to complete
3. Once deployed, Netlify will provide a URL (e.g., your-site-name.netlify.app)

### Step 6: Custom Domain (Optional)

1. In your site's dashboard, go to "Domain settings"
2. Click "Add custom domain" and follow the instructions

---

## Render Deployment

### Step 1: Prepare Your GitHub Repository

1. Push your code to a GitHub repository (if you haven't already)
2. Make sure your `package.json` has proper build and start scripts

### Step 2: Sign up/Log in to Render

1. Go to [Render](https://render.com/) and sign up or log in
2. Click "New" and select "Web Service"

### Step 3: Configure Your Web Service

Enter these settings:

- **Name**: `coffee-compass` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose the region closest to your users
- **Branch**: `main` (or your main branch name)
- **Root Directory**: *(leave empty)*
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (for testing) or select a paid tier for production

### Step 4: Environment Variables

1. Scroll down to the "Environment" section
2. Add the following environment variable:
   - Key: `GOOGLE_MAPS_API_KEY`
   - Value: `AIzaSyB7k9OzFNfair6vp-EDCVaBilH_DL4ebM8`

### Step 5: Create Web Service

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Render will provide a URL for your application (e.g., coffee-compass.onrender.com)

### Step 6: Custom Domain (Optional)

1. In your service dashboard, go to the "Settings" tab
2. Scroll to "Custom Domains"
3. Click "Add Custom Domain" and follow the instructions

---

## Important Notes for Both Platforms

1. **HTTPS**: Both Netlify and Render provide HTTPS automatically
2. **API Keys**: Be careful with API keys; use environment variables as shown above
3. **Debugging**: Check the deploy logs if your application doesn't work as expected
4. **Database**: If you need a database in the future, consider:
   - For Netlify: Use Netlify addons or external services like Supabase or MongoDB Atlas
   - For Render: Use Render's PostgreSQL database service

## After Deployment

1. Test your application thoroughly
2. Ensure all features are working correctly
3. Check that the Google Maps integration is functioning properly
4. Verify that the search and filter capabilities work as expected

If you encounter any issues during deployment, refer to the official documentation:
- [Netlify Docs](https://docs.netlify.com/)
- [Render Docs](https://render.com/docs/)