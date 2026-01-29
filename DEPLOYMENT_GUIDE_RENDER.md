---
description: Deploy MGT System to Render (FREE) + MongoDB Atlas (FREE)
---

# 🚀 Deploy MGT System to Render (FREE)

**Total Cost: $0/month**  
**Time Required: 45-60 minutes**

---

## ✅ PHASE 1: CODE PREPARATION (COMPLETED!)

I've already prepared your code with these changes:
- ✅ Updated `.gitignore` for production
- ✅ Added production start script to `package.json`
- ✅ Updated server to use environment variables (PORT, CORS_ORIGIN)
- ✅ Created `.env.render` template with your environment variables

**Next: You need to push code to GitHub**

---

## 📦 PHASE 2: PUSH CODE TO GITHUB (5 minutes)

### Step 1: Initialize Git (if not already done)

Open PowerShell in your project folder and run:

```powershell
cd "f:\docs\Wonderful trading\MGT"
git init
```

### Step 2: Add all files

```powershell
git add .
```

### Step 3: Commit changes

```powershell
git commit -m "Prepare MGT system for Render deployment"
```

### Step 4: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `mgt-system` (or any name you prefer)
3. **Visibility**: Private (recommended) or Public
4. **DO NOT** initialize with README, .gitignore, or license
5. Click **"Create repository"**

### Step 5: Push to GitHub

GitHub will show you commands. Run these:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/mgt-system.git
git branch -M main
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

✅ **When done, tell me and I'll guide you to Phase 3**

---

## 🗄️ PHASE 3: SET UP MONGODB ATLAS (15 minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with **Google** or **Email** (easier with Google)
3. Choose **FREE** tier
4. Click **"Create a deployment"** or **"Build a Database"**

### Step 2: Create FREE Cluster

1. **Cloud Provider**: Choose **AWS**
2. **Region**: Choose closest to you:
   - Europe: `Frankfurt (eu-central-1)`
   - US: `N. Virginia (us-east-1)`
   - Africa: `Frankfurt (eu-central-1)` (closest)
3. **Cluster Tier**: Select **M0 Sandbox (FREE FOREVER)**
4. **Cluster Name**: `mgt-cluster` (or any name)
5. Click **"Create Deployment"** or **"Create"**

⏰ **Wait 3-5 minutes** for cluster creation

### Step 3: Create Database User

1. You'll see a popup **"Security Quickstart"**
2. **Authentication Method**: Username and Password
3. **Username**: `mgt-admin`
4. **Password**: Click **"Autogenerate Secure Password"**
5. **IMPORTANT**: Click the **COPY** button and save password somewhere safe!
6. Click **"Create User"**

### Step 4: Set Network Access

1. In the same popup, scroll to **"Where would you like to connect from?"**
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. **ALSO** click **"Add a Different IP Address"**
5. Enter: `0.0.0.0/0` (allows access from anywhere - needed for Render)
6. Description: `Allow from anywhere (Render)`
7. Click **"Add Entry"**
8. Click **"Finish and Close"**

### Step 5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"** (or "Connect your application")
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. **Copy** the connection string (looks like this):
   ```
   mongodb+srv://mgt-admin:<password>@mgt-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with the password you saved earlier
8. **Add database name** before the `?`:
   ```
   mongodb+srv://mgt-admin:YOUR_PASSWORD@mgt-cluster.xxxxx.mongodb.net/mgt_production?retryWrites=true&w=majority
   ```

**SAVE THIS COMPLETE CONNECTION STRING!** You'll need it for Render.

✅ **When done, tell me and I'll guide you to Phase 4**

---

## 🎨 PHASE 4: SET UP CLOUDINARY (10 minutes)

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with **Email** or **Google**
3. Fill in:
   - **Cloud name**: `mgt-files` (or any unique name)
   - **Email**: Your email
   - **Password**: Create password
4. Click **"Create Account"**
5. Verify your email

### Step 2: Get API Credentials

1. After login, you'll see the **Dashboard**
2. Look for **"Account Details"** or **"API Keys"** section
3. You'll see:
   - **Cloud Name**: (e.g., `mgt-files`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click "Reveal" to see it)
4. **SAVE ALL THREE** - you'll need them for Render

✅ **When done, tell me and I'll guide you to Phase 5**

---

## 🚀 PHASE 5: DEPLOY BACKEND TO RENDER (15 minutes)

### Step 1: Create Render Account

1. Go to: https://render.com/
2. Click **"Get Started for Free"**
3. Sign up with **GitHub** (easiest - connects automatically)
4. Authorize Render to access your GitHub

### Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find your **`mgt-system`** repository
5. Click **"Connect"**

### Step 3: Configure Service

**Basic Settings:**
- **Name**: `mgt-backend` (or any name you like)
- **Region**: Choose closest to your MongoDB region
- **Branch**: `main`
- **Root Directory**: Leave empty (or `.` for root)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (first option)

### Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** for each of these:

```
Key: MONGODB_CONNECTION_URL
Value: mongodb+srv://mgt-admin:YOUR_PASSWORD@mgt-cluster.xxxxx.mongodb.net/mgt_production?retryWrites=true&w=majority

Key: accountant_Secret
Value: asd5253435454ktjregjrt4jt4n5gfghk

Key: cashier_Secret
Value: jhdhsjdhcxnscdcd4r325532452

Key: designer_Secret
Value: hfcedjf

Key: workShop_Secret
Value: hfc5436546546edjf

Key: reception_Secret
Value: 12345

Key: manager_Secret
Value: hfc5436546sdjfhediur78348ru3efbrrywhd546edjf

Key: superAdmin_Secret
Value: asdgfghk

Key: inventoryClerk_Secret
Value: eQfn6hg1p2Y6R1rccAHQibYGBbnmaB

Key: sms_Tocken
Value: zA-4cYJKBfPcSuEJNRUK5I7EiJsfdLhNVPpJvgycQIWpTBAa149JnA10Ef4pi1n-

Key: send_SMS_From
Value: +251984169534

Key: CORS_ORIGIN
Value: http://localhost:3000

Key: NODE_ENV
Value: production

Key: CLOUDINARY_CLOUD_NAME
Value: (your Cloudinary cloud name)

Key: CLOUDINARY_API_KEY
Value: (your Cloudinary API key)

Key: CLOUDINARY_API_SECRET
Value: (your Cloudinary API secret)
```

**IMPORTANT**: Replace MongoDB connection string with YOUR actual connection string!

### Step 5: Create Service

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Wait 5-10 minutes for deployment

### Step 6: Get Your Backend URL

1. Once deployed, you'll see: **"Your service is live 🎉"**
2. Your URL will be: `https://mgt-backend.onrender.com` (or similar)
3. **SAVE THIS URL** - you need it for frontend!

### Step 7: Test Backend

1. Visit: `https://mgt-backend.onrender.com/graphql`
2. You should see Apollo GraphQL Playground
3. If you see it, backend is working! ✅

✅ **When done, tell me and I'll guide you to Phase 6**

---

## 💻 PHASE 6: DEPLOY FRONTEND TO RENDER (10 minutes)

### Step 1: Update Frontend API URLs

**IMPORTANT**: Before deploying frontend, we need to update the API URLs.

**Tell me your backend URL** (from Phase 5, Step 6) and I'll update the frontend code for you!

It should look like: `https://mgt-backend-xxxx.onrender.com`

### Step 2: Create Frontend Service

1. Go to Render Dashboard
2. Click **"New +"** → **"Static Site"**
3. Connect same repository: **`mgt-system`**
4. Click **"Connect"**

### Step 3: Configure Static Site

**Basic Settings:**
- **Name**: `mgt-frontend`
- **Branch**: `main`
- **Root Directory**: `MGT-frontend-main`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `MGT-frontend-main/build`

### Step 4: Create Static Site

1. Click **"Create Static Site"**
2. Wait 5-10 minutes for build and deployment

### Step 5: Get Your Frontend URL

1. Once deployed: **"Your site is live 🎉"**
2. Your URL: `https://mgt-frontend.onrender.com` (or similar)
3. This is your **LIVE APPLICATION URL**!

### Step 6: Update CORS in Backend

1. Go back to your **backend service** on Render
2. Go to **"Environment"** tab
3. Find **`CORS_ORIGIN`** variable
4. Update value to your frontend URL: `https://mgt-frontend.onrender.com`
5. Click **"Save Changes"**
6. Backend will automatically redeploy (2-3 minutes)

✅ **When done, tell me and I'll guide you to testing!**

---

## 🧪 PHASE 7: TESTING (5 minutes)

### Step 1: Test Your Application

1. Visit your frontend URL: `https://mgt-frontend.onrender.com`
2. Try logging in
3. Create a test order
4. Check if everything works

### Step 2: Common Issues

**If login doesn't work:**
- Check browser console for errors
- Verify CORS_ORIGIN is set correctly
- Verify MongoDB connection string is correct

**If backend is slow (30-60 seconds):**
- This is normal for Render free tier (cold start)
- First request after 15 minutes of inactivity will be slow
- Subsequent requests will be fast

**If images don't upload:**
- We'll need to integrate Cloudinary (I can help with this later)

---

## 🎉 DEPLOYMENT COMPLETE!

**Your MGT System is now LIVE!**

**URLs:**
- 🌐 Frontend: `https://mgt-frontend.onrender.com`
- 🔧 Backend: `https://mgt-backend.onrender.com`
- 🗄️ Database: MongoDB Atlas (managed)

**Cost:** $0/month (completely FREE!)

---

## 📝 UPDATING YOUR APP

Every time you make changes:

```powershell
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Render automatically deploys! (2-5 minutes)
```

---

## 🔄 MIGRATION TO DIGITALOCEAN (After 1 Month)

When you're ready to upgrade to DigitalOcean ($5/month):

1. Use the DigitalOcean guide I created earlier
2. Copy environment variables from Render
3. Update frontend API URLs
4. Deploy to DigitalOcean
5. Test everything
6. Delete Render services (or keep as backup)

**Migration time:** 15-20 minutes

---

## 📞 NEED HELP?

If you get stuck at any step, tell me:
1. Which phase you're on
2. What error you're seeing
3. Screenshot if possible

I'll help you troubleshoot!

---

**Ready to start? Begin with PHASE 2: Push Code to GitHub!**
