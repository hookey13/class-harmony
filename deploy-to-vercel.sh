#!/bin/bash

# Script to help deploy Class Harmony to Vercel

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Class Harmony Vercel Deployment Helper ===${NC}\n"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
    echo -e "${RED}Error: Please run this script from the root directory of Class Harmony.${NC}"
    exit 1
fi

# Ensure all changes are committed
echo -e "${YELLOW}Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}You have uncommitted changes. Please commit them first.${NC}"
    git status
    exit 1
fi

echo -e "${GREEN}All changes are committed.${NC}\n"

# Step 1: GitHub Setup
echo -e "${BLUE}Step 1: GitHub Repository${NC}"
echo -e "${YELLOW}Do you already have this code in a GitHub repository? (y/n)${NC}"
read -r has_github_repo

if [ "$has_github_repo" = "n" ]; then
    echo -e "${YELLOW}Please create a GitHub repository and push your code to it.${NC}"
    echo -e "${YELLOW}Repository name (e.g., 'class-harmony'):${NC}"
    read -r repo_name
    
    echo -e "${YELLOW}GitHub username:${NC}"
    read -r github_username
    
    echo -e "${GREEN}Setting up GitHub repository...${NC}"
    git remote add origin "https://github.com/$github_username/$repo_name.git"
    git push -u origin main || git push -u origin master
    
    echo -e "${GREEN}Code pushed to GitHub repository.${NC}\n"
fi

# Step 2: Vercel Setup
echo -e "${BLUE}Step 2: Vercel Setup${NC}"
echo -e "${YELLOW}Have you installed Vercel CLI? (y/n)${NC}"
read -r has_vercel_cli

if [ "$has_vercel_cli" = "n" ]; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
    echo -e "${GREEN}Vercel CLI installed.${NC}\n"
fi

# Step 3: Deploy to Vercel
echo -e "${BLUE}Step 3: Deployment${NC}"
echo -e "${YELLOW}Please log in to Vercel if you're not already logged in.${NC}"
vercel login

# Deploy server
echo -e "${BLUE}Deploying server...${NC}"
cd server || exit
vercel --prod

# Get server URL
echo -e "${YELLOW}Please enter the deployed server URL:${NC}"
read -r server_url

# Update client env
cd ../client || exit
echo "REACT_APP_API_URL=${server_url}/api" > .env.production
echo "REACT_APP_ENV=production" >> .env.production
echo "GENERATE_SOURCEMAP=false" >> .env.production

# Deploy client
echo -e "${BLUE}Deploying client...${NC}"
vercel --prod

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Remember to update your server's CORS settings to allow the client URL.${NC}"

cd ..
echo -e "${BLUE}=== Deployment Complete ===${NC}" 