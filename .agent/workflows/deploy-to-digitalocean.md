---
description: Complete guide to deploy MGT system to DigitalOcean + MongoDB Atlas
---

# Deploy MGT System to DigitalOcean + MongoDB Atlas

This guide will walk you through deploying your full-stack MGT application using MongoDB Atlas (database) and DigitalOcean App Platform (hosting).

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] GitHub account (to connect your code)
- [ ] DigitalOcean account (sign up at https://www.digitalocean.com)
- [ ] MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)
- [ ] Your code pushed to a GitHub repository
- [ ] Credit card for verification (DigitalOcean requires it even for free credits)

---

## PART 1: Set Up MongoDB Atlas (Database) - 15 minutes

### Step 1.1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/Email
3. Choose **FREE** tier (M0 Sandbox)
4. Click "Create a cluster"

### Step 1.2: Configure Your Cluster
1. **Cloud Provider**: Choose **AWS** (most reliable)
2. **Region**: Choose closest to your users (e.g., Frankfurt for Europe, N. Virginia for US)
3. **Cluster Tier**: Select **M0 Sandbox (FREE)**
4. **Cluster Name**: `mgt-production` (or any name you prefer)
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 1.3: Create Database User
1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. **Authentication Method**: Password
4. **Username**: `mgt-admin` (or your choice)
5. **Password**: Click "Autogenerate Secure Password" and **SAVE IT SOMEWHERE SAFE**
6. **Database User Privileges**: Select "Read and write to any database"
7. Click **"Add User"**

### Step 1.4: Configure Network Access
1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is needed for DigitalOcean to connect
   - Your app will still require username/password
4. Click **"Confirm"**

### Step 1.5: Get Your Connection String
1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://mgt-admin:<password>@mgt-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with the password you saved earlier
8. **Save this complete connection string** - you'll need it later!

### Step 1.6: Create Your Database
1. Click **"Browse Collections"**
2. Click **"Add My Own Data"**
3. **Database Name**: `mgt_production`
4. **Collection Name**: `users` (we'll create others automatically)
5. Click **"Create"**

✅ **MongoDB Atlas Setup Complete!**

---

## PART 2: Prepare Your Code for Deployment - 10 minutes

### Step 2.1: Push Code to GitHub (if not already done)

If your code is not on GitHub yet:

```bash
# Navigate to your project root
cd "f:\docs\Wonderful trading\MGT"

# Initialize git (if not already)
git init

# Create .gitignore file
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "MGT-frontend-main/node_modules/" >> .gitignore
echo "MGT-frontend-main/build/" >> .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit for deployment"

# Create GitHub repository (do this on GitHub.com)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2.2: Update Backend Configuration

Create a production-ready environment configuration:

**File: `f:\docs\Wonderful trading\MGT\.env.production`**
```env
# MongoDB Connection (use your Atlas connection string)
MONGODB_URI=mongodb+srv://mgt-admin:YOUR_PASSWORD@mgt-production.xxxxx.mongodb.net/mgt_production?retryWrites=true&w=majority

# Server Configuration
PORT=4000
NODE_ENV=production

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# CORS Origins (will update after frontend deployment)
CORS_ORIGIN=*

# Add any other environment variables from your .env file
```

### Step 2.3: Update Frontend Configuration

You'll need to update the API URLs in your frontend after backend deployment.

**Files to update later:**
- `MGT-frontend-main/src/index.js` (lines 25, 30)
- `MGT-frontend-main/src/context/index.js` (if API URL is stored there)

---

## PART 3: Deploy Backend to DigitalOcean - 20 minutes

### Step 3.1: Create DigitalOcean Account
1. Go to https://www.digitalocean.com
2. Sign up (new users get **$200 credit for 60 days**)
3. Verify your email
4. Add payment method (required for verification)

### Step 3.2: Create New App
1. Click **"Create"** → **"Apps"**
2. Choose **"GitHub"** as source
3. Click **"Authorize DigitalOcean"** to connect GitHub
4. Select your **MGT repository**
5. Click **"Next"**

### Step 3.3: Configure Backend App
1. **Source Directory**: Leave as `/` (root) or specify backend folder if separate
2. **Branch**: `main`
3. **Autodeploy**: ✅ Enable (auto-deploy on git push)
4. Click **"Edit Plan"**
   - Choose **Basic** plan
   - Select **$5/month** (512MB RAM, 1 vCPU) - cheapest option
5. Click **"Back"**

### Step 3.4: Configure Environment Variables
1. Scroll to **"Environment Variables"**
2. Click **"Edit"**
3. Add these variables (click "Add Variable" for each):

   ```
   MONGODB_URI = mongodb+srv://mgt-admin:YOUR_PASSWORD@mgt-production.xxxxx.mongodb.net/mgt_production?retryWrites=true&w=majority
   
   PORT = 8080
   
   NODE_ENV = production
   
   JWT_SECRET = your-super-secret-jwt-key-change-this
   
   CORS_ORIGIN = *
   ```

4. Click **"Save"**

### Step 3.5: Configure Build & Run Commands
1. **Build Command**: 
   ```bash
   npm install
   ```

2. **Run Command**: 
   ```bash
   node index.mjs
   ```

3. **HTTP Port**: `8080` (DigitalOcean default)

### Step 3.6: Configure Health Checks
1. **HTTP Path**: `/` or `/graphql`
2. **Port**: `8080`

### Step 3.7: Name Your App
1. **App Name**: `mgt-backend` (or your choice)
2. **Region**: Choose closest to your users
3. Click **"Next"**

### Step 3.8: Review and Create
1. Review all settings
2. Click **"Create Resources"**
3. Wait 5-10 minutes for deployment

### Step 3.9: Get Your Backend URL
1. Once deployed, you'll see a URL like: `https://mgt-backend-xxxxx.ondigitalocean.app`
2. **SAVE THIS URL** - you'll need it for frontend!
3. Test it by visiting: `https://mgt-backend-xxxxx.ondigitalocean.app/graphql`

✅ **Backend Deployed!**

---

## PART 4: Deploy Frontend to DigitalOcean - 15 minutes

### Step 4.1: Update Frontend API URLs

**IMPORTANT**: Before deploying frontend, update API endpoints:

**File: `MGT-frontend-main/src/index.js`**

Change line 25:
```javascript
// FROM:
uri: store?.getState()?.apiUrl?.url,

// TO:
uri: "https://mgt-backend-xxxxx.ondigitalocean.app/graphql",
```

Change line 30:
```javascript
// FROM:
url: "ws://localhost:4000/",

// TO:
url: "wss://mgt-backend-xxxxx.ondigitalocean.app/",
```

**Commit and push changes:**
```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

### Step 4.2: Create Frontend App on DigitalOcean
1. Go to DigitalOcean Dashboard
2. Click **"Create"** → **"Apps"**
3. Choose **GitHub** source
4. Select **same repository**
5. Click **"Next"**

### Step 4.3: Configure Frontend App
1. **Source Directory**: `/MGT-frontend-main`
2. **Branch**: `main`
3. **Autodeploy**: ✅ Enable
4. Click **"Edit Plan"**
   - Choose **Static Site** (FREE for static React apps!)
   - This is perfect for React builds
5. Click **"Back"**

### Step 4.4: Configure Build Settings
1. **Build Command**: 
   ```bash
   npm install && npm run build
   ```

2. **Output Directory**: 
   ```
   build
   ```

3. **Environment Variables**: (usually none needed for frontend)

### Step 4.5: Name Your Frontend App
1. **App Name**: `mgt-frontend`
2. **Region**: Same as backend
3. Click **"Next"**

### Step 4.6: Review and Create
1. Review settings
2. Click **"Create Resources"**
3. Wait 5-10 minutes for build and deployment

### Step 4.7: Get Your Frontend URL
1. You'll get a URL like: `https://mgt-frontend-xxxxx.ondigitalocean.app`
2. This is your **live application URL**!

✅ **Frontend Deployed!**

---

## PART 5: Configure CORS and Final Settings - 5 minutes

### Step 5.1: Update Backend CORS Settings
1. Go to DigitalOcean Dashboard
2. Click on **mgt-backend** app
3. Go to **Settings** → **App-Level Environment Variables**
4. Edit `CORS_ORIGIN`:
   ```
   CORS_ORIGIN = https://mgt-frontend-xxxxx.ondigitalocean.app
   ```
5. Click **"Save"**
6. App will automatically redeploy

### Step 5.2: Test Your Application
1. Visit your frontend URL: `https://mgt-frontend-xxxxx.ondigitalocean.app`
2. Try logging in
3. Test creating orders, inventory, etc.
4. Check browser console for any errors

---

## PART 6: Set Up Custom Domain (Optional) - 10 minutes

### Step 6.1: Add Domain to DigitalOcean
1. Go to **Networking** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `mgtapp.com`)

### Step 6.2: Configure DNS
1. Add these records:
   - **A Record**: `@` → Your app's IP
   - **CNAME**: `www` → Your app URL

### Step 6.3: Update App Domain
1. Go to your app → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain
4. Follow verification steps

---

## PART 7: Ongoing Updates - How to Deploy Changes

### Every Time You Make Changes:

```bash
# 1. Make your changes locally
# 2. Test locally (npm start)
# 3. Commit and push

git add .
git commit -m "Description of changes"
git push origin main

# 4. DigitalOcean automatically deploys! (2-5 minutes)
# 5. Check deployment status in DigitalOcean dashboard
```

### Rollback if Needed:
1. Go to DigitalOcean Dashboard
2. Click your app
3. Go to **"Activity"** tab
4. Click **"Rollback"** on previous deployment

---

## 📊 Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| MongoDB Atlas | M0 Free Tier | **$0** |
| DigitalOcean Backend | Basic ($5) | **$5** |
| DigitalOcean Frontend | Static Site | **$0** |
| **TOTAL** | | **$5/month** |

**Note**: With DigitalOcean's $200 credit, you get **40 months free** (if only using $5/month)!

---

## 🔧 Troubleshooting

### Backend won't start:
- Check logs in DigitalOcean dashboard
- Verify MongoDB connection string is correct
- Ensure all environment variables are set

### Frontend can't connect to backend:
- Verify API URLs are correct in `index.js`
- Check CORS settings in backend
- Check browser console for errors

### Database connection fails:
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check username/password in connection string
- Ensure database user has correct permissions

### Build fails:
- Check build logs in DigitalOcean
- Verify `package.json` has correct dependencies
- Try building locally first: `npm run build`

---

## 📞 Need Help?

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Community Forums**: https://www.digitalocean.com/community

---

## ✅ Deployment Complete!

Your MGT system is now live and accessible worldwide! 🎉

**Your URLs:**
- Frontend: `https://mgt-frontend-xxxxx.ondigitalocean.app`
- Backend API: `https://mgt-backend-xxxxx.ondigitalocean.app/graphql`
- Database: MongoDB Atlas (managed)

**Next Steps:**
1. Share the frontend URL with users
2. Set up monitoring (DigitalOcean has built-in monitoring)
3. Configure backups in MongoDB Atlas
4. Consider adding a custom domain
5. Set up SSL certificates (automatic with DigitalOcean)
