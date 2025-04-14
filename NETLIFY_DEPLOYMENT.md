# Deploying CoffeeCompass to Netlify

This guide explains how to deploy the CoffeeCompass application to Netlify.

## Prerequisites

1. A [GitHub](https://github.com/) account
2. A [Netlify](https://www.netlify.com/) account (you can sign up using your GitHub account)
3. Your Google Maps API key

## Step 1: Prepare Your Project for Deployment

1. Make sure your code is working correctly in your local environment.
2. Create a new file named `netlify.toml` in the root directory of your project with the following content:

```toml
[build]
  command = "npm run build"
  publish = "dist/public"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. Create a `netlify/functions` directory in your project:

```bash
mkdir -p netlify/functions
```

4. Create a function to serve your API in `netlify/functions/api.js`:

```javascript
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { storage } = require('../../server/storage');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/get-maps-key', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: true, 
      message: 'Google Maps API key is not configured' 
    });
  }
  res.json({ key: apiKey });
});

app.get('/api/coffee-shops/search', async (req, res) => {
  try {
    const query = req.query.query || '';
    const filter = req.query.filter || '';
    const distance = Number(req.query.distance) || 5;
    const rating = Number(req.query.rating) || 0;
    const types = Array.isArray(req.query.types) 
      ? req.query.types 
      : req.query.types 
        ? [req.query.types] 
        : [];
    const page = Number(req.query.page) || 1;
    const limit = 10;

    const result = await storage.searchCoffeeShops({
      query,
      filter,
      distance,
      rating,
      types,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    console.error('Error searching coffee shops:', error);
    res.status(500).json({ message: 'Failed to search coffee shops' });
  }
});

app.get('/api/coffee-shops/favorites', async (req, res) => {
  try {
    const userId = 1; // Mock user ID
    const favorites = await storage.getFavoriteCoffeeShops(userId);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

app.get('/api/coffee-shops/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const shop = await storage.getCoffeeShopById(id);
    if (!shop) {
      return res.status(404).json({ message: 'Coffee shop not found' });
    }
    
    res.json(shop);
  } catch (error) {
    console.error('Error fetching coffee shop:', error);
    res.status(500).json({ message: 'Failed to fetch coffee shop details' });
  }
});

app.post('/api/coffee-shops/:id/favorite', async (req, res) => {
  try {
    const shopId = Number(req.params.id);
    if (isNaN(shopId)) {
      return res.status(400).json({ message: 'Invalid shop ID' });
    }

    const { isFavorite } = req.body;
    const userId = 1; // Mock user ID

    if (isFavorite) {
      await storage.addFavorite(userId, shopId);
    } else {
      await storage.removeFavorite(userId, shopId);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({ message: 'Failed to update favorite status' });
  }
});

module.exports.handler = serverless(app);
```

5. Update your `package.json` to include Netlify Function dependencies:

```json
{
  "dependencies": {
    "serverless-http": "^3.2.0"
  }
}
```

## Step 2: Push Your Code to GitHub

1. Create a new repository on GitHub
2. Initialize Git in your project (if not already done)
3. Add your files and commit them
4. Push to your GitHub repository

```bash
git init
git add .
git commit -m "Initial commit for Netlify deployment"
git remote add origin https://github.com/yourusername/coffee-compass.git
git push -u origin main
```

## Step 3: Connect Netlify to Your GitHub Repository

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub repositories
5. Select your coffee-compass repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
7. Click "Show advanced" and add environment variables:
   - Add `GOOGLE_MAPS_API_KEY` with your API key value
8. Click "Deploy site"

## Step 4: Monitor Your Deployment

1. Netlify will automatically build and deploy your site
2. You can monitor the build progress in the Netlify dashboard
3. Once deployment is complete, Netlify will provide a URL where your site is accessible (e.g., https://your-coffee-compass.netlify.app)

## Step 5: Domain Setup (Optional)

1. If you want to use a custom domain:
   - Go to "Domain settings" in your Netlify site dashboard
   - Click "Add custom domain"
   - Follow the instructions to set up your domain

## Troubleshooting

If you encounter any issues:

1. Check the build logs in Netlify to see if there are any errors
2. Ensure your environment variables are set correctly
3. Verify that the API endpoints are working correctly

## Maintaining Your Deployment

1. Each time you push changes to your GitHub repository, Netlify will automatically rebuild and redeploy your site
2. You can configure deploy previews and branch deployments in the Netlify settings for more advanced workflows

Happy deploying! 🚀