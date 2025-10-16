# 🚀 Vercel Environment Variables Setup Guide

## 🚨 Issue Fixed
The deployment error "Environment Variable references Secret which does not exist" has been resolved by removing secret references from `vercel.json`.

## 📋 Required Environment Variables

You need to add these environment variables manually in your Vercel dashboard:

### 🔗 Supabase Configuration
| Variable Name | Value | Type |
|---------------|-------|------|
| ` Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjIzOTAsImV4cCI6MjA3NTY5ODM5MH0.eYFfChSM7YwhjkArKlYiBfU1vAiwYekM7YlgBiO_RyU` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk` | Secret |
| `DATABASE_URL` | `postgresql://postgres:4CIw4WpTyFbXYPu8@db.rcxjtnojxtugtpjtydzu.supabase.co:5432/postgres` | Secret |

### 🔐 NextAuth Configuration
| Variable Name | Value | Type |
|---------------|-------|------|
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Public |
| `NEXTAUTH_SECRET` | `QawtxEqo7xWsy3EdNReafJGGTBq/DxXTUeFhPTbKEz0=` | Secret |

### 🌍 Node Environment
| Variable Name | Value | Type |
|---------------|-------|------|
| `NODE_ENV` | `production` | Public |

---

## 📝 Step-by-Step Setup

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

#### **Public Variables** (Available in browser)
1. **NEXT_PUBLIC_SUPABASE_URL**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://rcxjtnojxtugtpjtydzu.supabase.co`
   - Environments: ✅ Production ✅ Preview ✅ Development

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjIzOTAsImV4cCI6MjA3NTY5ODM5MH0.eYFfChSM7YwhjkArKlYiBfU1vAiwYekM7YlgBiO_RyU`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **NEXTAUTH_URL**
   - Name: `NEXTAUTH_URL`
   - Value: `https://your-domain.vercel.app` (replace with your actual domain)
   - Environments: ✅ Production ✅ Preview ✅ Development

4. **NODE_ENV**
   - Name: `NODE_ENV`
   - Value: `production`
   - Environments: ✅ Production ✅ Preview ✅ Development

#### **Secret Variables** (Server-side only)
1. **SUPABASE_SERVICE_ROLE_KEY**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk`
   - Environments: ✅ Production ✅ Preview ✅ Development

2. **DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:4CIw4WpTyFbXYPu8@db.rcxjtnojxtugtpjtydzu.supabase.co:5432/postgres`
   - Environments: ✅ Production ✅ Preview ✅ Development

3. **NEXTAUTH_SECRET**
   - Name: `NEXTAUTH_SECRET`
   - Value: `QawtxEqo7xWsy3EdNReafJGGTBq/DxXTUeFhPTbKEz0=`
   - Environments: ✅ Production ✅ Preview ✅ Development

### Step 3: Save and Deploy
1. Click **Save** after adding each variable
2. Trigger a new deployment or wait for automatic deployment
3. Monitor the deployment logs for success

---

## 🎯 Quick Copy-Paste Values

### **Public Variables**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rcxjtnojxtugtpjtydzu.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6INEXT_PUBLIC_SUPABASE_URL` | `https://rcxjtnojxtugtpjtydzu.supabase.co` |nJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjIzOTAsImV4cCI6MjA3NTY5ODM5MH0.eYFfChSM7YwhjkArKlYiBfU1vAiwYekM7YlgBiO_RyU

NEXTAUTH_URL=https://your-domain.vercel.app

NODE_ENV=production
```

### **Secret Variables**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEyMjM5MCwiZXhwIjoyMDc1Njk4MzkwfQ.GKOCMCzhWfhzq7yLXErpiU9Zh81LbXXqPa98OeWyYsk

DATABASE_URL=postgresql://postgres:4CIw4WpTyFbXYPu8@db.rcxjtnojxtugtpjtydzu.supabase.co:5432/postgres

NEXTAUTH_SECRET=QawtxEqo7xWsy3EdNReafJGGTBq/DxXTUeFhPTbKEz0=
```

---

## ⚠️ Important Notes

### ✅ **DO**
- Add all required environment variables
- Set environments to Production, Preview, and Development
- Replace `your-domain.vercel.app` with your actual Vercel domain
- Test deployment after adding variables

### ❌ **DON'T**
- Use the old `vercel.json` with secret references
- Forget to update NEXTAUTH_URL with your actual domain
- Skip adding secret variables (they're required for server-side operations)

---

## 🔍 Verification Steps

### 1. Check Environment Variables in Vercel
- Go to Project Settings → Environment Variables
- Ensure all 7 variables are listed
- Verify values match exactly

### 2. Test Deployment
- Trigger a new deployment
- Monitor build logs for errors
- Check that the site loads correctly

### 3. Test Functionality
- Visit your deployed site
- Test API endpoints: `/api/health`
- Check database connectivity
- Verify authentication works

---

## 🚨 Troubleshooting

### **Build Fails with Missing Variables**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
**Solution**: Add the missing environment variable in Vercel dashboard

### **Database Connection Error**
```
Error: Could not connect to database
```
**Solution**: Verify DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct

### **NextAuth Error**
```
Error: NEXTAUTH_SECRET must be defined
```
**Solution**: Add NEXTAUTH_SECRET environment variable

### **CORS Issues**
```
Error: CORS policy violation
```
**Solution**: Ensure NEXTAUTH_URL matches your deployment domain

---

## 🎉 Success Checklist

- [ ] All 7 environment variables added to Vercel
- [ ] NEXTAUTH_URL updated with actual domain
- [ ] Deployment completes without errors
- [ ] Website loads correctly
- [ ] API endpoints respond properly
- [ ] Database connection works
- [ ] Authentication functions correctly

---

## 📞 Additional Support

If you still encounter issues:

1. **Check Vercel Function Logs**: Dashboard → Functions → Logs
2. **Verify Supabase Connection**: Test with `/api/health` endpoint
3. **Review Environment Variables**: Double-check for typos
4. **Contact Support**: Create an issue in your project repository

**Your deployment should now work perfectly!** 🚀