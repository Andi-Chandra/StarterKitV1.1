# 🔐 NextAuth Configuration Guide

## 📋 Environment Variables Explained

### 1. NEXTAUTH_URL
**What it is**: The canonical URL of your production deployment
**Purpose**: Used by NextAuth for OAuth callbacks and redirects
**Format**: Full URL without trailing slash

### 2. NEXTAUTH_SECRET
**What it is**: A secret key used to encrypt JWT tokens and sessions
**Purpose**: Security for authentication sessions
**Format**: Random string (minimum 32 characters recommended)

---

## 🚀 Setting Up for Different Environments

### Development (Local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

### Production (Vercel)
```bash
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret
```

### Production (Custom Domain)
```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
```

---

## 🔑 How to Generate NEXTAUTH_SECRET

### Method 1: Using Node.js (Recommended)
```bash
# Open terminal and run:
node -e "console.log(crypto.randomBytes(32).toString('base64'))"
```

### Method 2: Using OpenSSL
```bash
# Generate random secret:
openssl rand -base64 32
```

### Method 3: Online Generator
Visit: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)

### Method 4: Using Python
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 📝 Step-by-Step Setup

### Step 1: Generate Your Secret
Run one of the commands above to generate a secure secret. You'll get something like:
```
SM2b3p5v8x9A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6
```

### Step 2: Update Environment Files

#### For Local Development (.env.local)
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
```

#### For Production (Vercel Dashboard)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these variables:
   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://your-domain.vercel.app`
   - **Environments**: Production, Preview, Development

   - **Name**: `NEXTAUTH_SECRET`
   - **Value**: `your-generated-secret-here`
   - **Environments**: Production, Preview, Development

---

## 🌍 Environment-Specific URLs

### Development
```bash
NEXTAUTH_URL=http://localhost:3000
```

### Vercel Preview Deployment
```bash
NEXTAUTH_URL=https://your-project-git-branch.vercel.app
```

### Vercel Production
```bash
NEXTAUTH_URL=https://your-project.vercel.app
```

### Custom Domain
```bash
NEXTAUTH_URL=https://your-custom-domain.com
```

---

## ⚙️ NextAuth Configuration File

Create or update your NextAuth configuration:

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
```

---

## 🔧 Quick Setup Commands

### 1. Generate Secret and Update .env.local
```bash
# Generate secret
SECRET=$(node -e "console.log(crypto.randomBytes(32).toString('base64'))")

# Update .env.local
echo "" >> .env.local
echo "# NextAuth Configuration" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "NEXTAUTH_SECRET=$SECRET" >> .env.local

echo "✅ NextAuth configuration updated!"
echo "🔑 Generated Secret: $SECRET"
```

### 2. Verify Configuration
```bash
# Check if variables are set
grep -E "NEXTAUTH_URL|NEXTAUTH_SECRET" .env.local
```

---

## 🚨 Important Security Notes

### ✅ DO:
- Use a unique, randomly generated secret
- Keep the secret confidential
- Use different secrets for different environments
- Update secrets periodically for security

### ❌ DON'T:
- Use simple passwords like "secret" or "test"
- Commit secrets to version control
- Share secrets publicly
- Use the same secret across multiple projects

---

## 🛠️ Troubleshooting

### Common Issues

1. **Invalid NextAuth Secret**
   ```
   Error: NEXTAUTH_SECRET must be defined
   ```
   **Solution**: Make sure NEXTAUTH_SECRET is set and at least 32 characters

2. **Invalid NextAuth URL**
   ```
   Error: Invalid NEXTAUTH_URL
   ```
   **Solution**: Ensure URL includes protocol (http:// or https://)

3. **OAuth Callback Errors**
   ```
   Error: OAuth callback failed
   ```
   **Solution**: Check that NEXTAUTH_URL matches your deployment URL

### Debug Commands
```bash
# Check current environment variables
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "NEXTAUTH_SECRET length: ${#NEXTAUTH_SECRET}"

# Test NextAuth endpoint
curl http://localhost:3000/api/auth/session
```

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Environment Variables Guide](https://next-auth.js.org/configuration/options#environment-variables)
- [Secret Key Generator](https://generate-secret.vercel.app/)

---

## 🎯 Quick Checklist

- [ ] Generate secure NEXTAUTH_SECRET
- [ ] Set correct NEXTAUTH_URL for environment
- [ ] Update .env.local for development
- [ ] Configure Vercel environment variables
- [ ] Test authentication flow
- [ ] Verify OAuth callbacks work

---

**Need help?** Check the NextAuth documentation or create an issue in your project repository! 🚀