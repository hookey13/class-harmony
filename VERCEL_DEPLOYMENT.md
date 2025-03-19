# Vercel Deployment Guide for Class Harmony

This guide explains how to deploy the Class Harmony application to Vercel.

## Step 1: Push the codebase to GitHub

First, make sure your code is in a GitHub repository. If not, create a new repository and push your code there.

## Step 2: Connect to Vercel

1. Go to [Vercel](https://vercel.com) and sign up or log in
2. Click "Add New..." and select "Project"
3. Import your GitHub repository
4. You'll need to deploy both the client and server as separate projects

## Step 3: Configure Client Deployment

1. Select the client directory as the root directory
2. Vercel should auto-detect that it's a React app
3. Add the following environment variables:

```
REACT_APP_API_URL=https://your-server-deployment-url.vercel.app/api
REACT_APP_ENV=production
```

4. Click "Deploy"

## Step 4: Configure Server Deployment

1. Create a new project for the server
2. Select the server directory as the root directory
3. Set the following environment variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
CORS_ORIGIN=https://your-client-deployment-url.vercel.app
```

4. Click "Deploy"

## Step 5: Update Client API URL

After deploying the server, you'll need to update the client's `REACT_APP_API_URL` to point to your actual server deployment URL.

## Additional Environment Variables

If your application uses any of these features, make sure to add the corresponding environment variables:

```
EMAIL_SERVICE=your_email_service    # e.g., gmail
EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password  # or app password
EMAIL_FROM=noreply@classharmony.com
```

## Vercel Configuration Files

The repository contains `vercel.json` configuration files in both the client and server directories. These files handle routing and build settings for Vercel deployment. 