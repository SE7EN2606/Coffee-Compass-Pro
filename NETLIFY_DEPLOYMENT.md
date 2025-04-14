# Deploying CoffeeCompass to Netlify

Follow these simple steps to deploy your CoffeeCompass app to Netlify:

## Step 1: Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository. If you haven't created one yet:

1. Go to [GitHub](https://github.com/)
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "coffee-compass")
4. Make it public or private (your choice)
5. Click "Create repository"
6. Push your code using the GitHub instructions provided

## Step 2: Connect to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign in or create an account
2. Click "Add new site" → "Import an existing project"
3. Select "GitHub" as your Git provider
4. Authorize Netlify to access your GitHub account (if not already authorized)
5. Select your CoffeeCompass repository

## Step 3: Configure Build Settings

Netlify will detect that this is a Vite project. Use these exact settings:

- **Build command:** `npm run build`
- **Publish directory:** `dist/public`

These settings are already in your `netlify.toml` file, but verify they appear correctly.

## Step 4: Set Environment Variables

1. In your Netlify site dashboard, go to "Site Settings" → "Environment variables"
2. Add the following environment variable:
   - **Key:** `GOOGLE_MAPS_API_KEY`
   - **Value:** `AIzaSyB7k9OzFNfair6vp-EDCVaBilH_DL4ebM8` (use your API key)

## Step 5: Deploy

1. Click "Deploy site"
2. Wait for the build process to complete
3. Once deployment is finished, Netlify will provide a URL (e.g., `your-site-name.netlify.app`)

## Step 6: Test Your Deployed Site

1. Visit your Netlify URL to make sure everything works
2. Test all functionality (searching, viewing shop details, adding shops, etc.)

## Troubleshooting

If you encounter any issues:

1. Check Netlify's "Deploy" tab for build logs
2. Verify your environment variables are set correctly
3. Make sure your API key is valid and has the necessary permissions

## Future Updates

To update your site after making changes:

1. Push changes to your GitHub repository
2. Netlify will automatically detect changes and redeploy

## Custom Domain (Optional)

To use your own domain name:

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to set up your domain

Enjoy your deployed CoffeeCompass application!