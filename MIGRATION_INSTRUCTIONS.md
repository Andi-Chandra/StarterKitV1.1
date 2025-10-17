# Supabase Migration Instructions

## 🚀 Migration Status: Ready for Manual Execution

I've successfully prepared your Next.js project to work with Supabase PostgreSQL. Here's what has been completed:

### ✅ Completed Setup
1. **Environment Variables**: Updated with correct Supabase credentials
2. **Prisma Schema**: Configured for PostgreSQL
3. **Supabase Client**: Installed and configured
4. **Migration Script**: Generated comprehensive SQL migration

### 📋 Next Steps: Manual Migration Required

Since direct database connection from the development environment has network restrictions, you need to manually run the migration in your Supabase Dashboard.

## 🔧 How to Complete the Migration

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: `rcxjtnojxtugtpjtydzu`

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"**

### Step 3: Run Migration Script
1. Copy the entire content from `SUPABASE_MIGRATION.sql` file
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the migration

### Step 4: Verify Migration
After running the migration, you should see:
- ✅ 8 tables created
- ✅ Sample data inserted
- ✅ Indexes created
- ✅ Row Level Security enabled

## 📁 Migration Files Created

1. **`SUPABASE_MIGRATION.sql`** - Complete migration script
2. **`scripts/migrate-supabase.js`** - SQL generator
3. **`scripts/auto-migrate-supabase.js`** - Automated migration attempt
4. **`scripts/test-supabase-connection.js`** - Connection testing

## 🎯 What the Migration Creates

### Tables:
- `users` - User accounts and authentication
- `media_categories` - Media file categories
- `media_items` - Images and videos
- `sliders` - Image/video sliders
- `slider_items` - Individual slider content
- `site_config` - Site configuration
- `navigation_links` - Navigation menu items
- `social_media_links` - Social media profiles

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Performance indexes
- ✅ Sample data for testing
- ✅ Foreign key relationships
- ✅ Proper timestamps

## 🔄 After Migration

Once you've run the SQL migration:

1. **Test the API endpoints**:
   ```bash
   curl http://localhost:3000/api/sliders
   curl http://localhost:3000/api/media
   ```

2. **Visit your application**:
   - Homepage: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin

3. **Verify data appears**:
   - Image sliders should be visible
   - Admin dashboard should show sample data

## 🚨 Troubleshooting

If you encounter issues:

1. **Check Supabase Dashboard**: Make sure all tables were created
2. **Verify Environment Variables**: Ensure they match your Supabase project
3. **Test API Endpoints**: Use curl to test individual endpoints
4. **Check Browser Console**: Look for JavaScript errors

## 🎉 Expected Result

After successful migration, your Next.js application will be fully powered by Supabase PostgreSQL with:
- ✅ Real database operations
- ✅ Sample content for testing
- ✅ Admin dashboard functionality
- ✅ Image/video sliders
- ✅ Media management
- ✅ Ready for production deployment

---

**Next Step**: Run the SQL migration in your Supabase Dashboard, then test your application!

---

## Switch Prisma to PostgreSQL (Supabase)

If you want Prisma to use your Supabase Postgres instead of the bundled SQLite:

1) Update Prisma datasource provider
- Already applied in `prisma/schema.prisma`: `provider = "postgresql"`.
- Columns are mapped to existing Supabase snake_case names via `@map` so Prisma matches the Supabase schema.

2) Set `DATABASE_URL` to your Supabase connection string
- In local `.env` or `.env.local`:
  - `DATABASE_URL="postgresql://postgres:<password>@<host>:5432/postgres?sslmode=require"`
- In Vercel Project → Settings → Environment Variables (Production/Preview/Development):
  - `DATABASE_URL` with the same Postgres URL

3) Generate Prisma Client
```bash
npm run db:generate
```

4) Create and apply a migration (new/empty DB)
- For a new, empty Supabase project (no tables yet), let Prisma create the schema:
```bash
npx prisma migrate dev --name init_postgres
```

5) Using existing Supabase tables (recommended)
- If you have already run `SUPABASE_MIGRATION.sql` in Supabase, the tables exist and match the Prisma `@map`ped columns.
- In that case, prefer syncing the Prisma schema to the DB without creating new tables:
```bash
npx prisma db push
```
  - This should be a no-op if schemas match. If there is drift, Prisma will print the differences.

6) Production deploy
- Vercel: Ensure `DATABASE_URL` is set to the Supabase URL.
- Redeploy the app.
- Health check: `GET /api/health` should return `{ ok: true }`.

Notes
- The Prisma enums were replaced by string fields to align with the Supabase `TEXT` columns (`role`, `file_type`, `type`). Zod still enforces values like `IMAGE`/`VIDEO` in the API layer.
- If you prefer native Postgres enums, we can add a follow-up migration to convert these `TEXT` columns to enum types.
